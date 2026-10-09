import type { Rule } from 'eslint'
import type * as ESTree from 'estree'

interface AstExpression extends ESTree.Node {
  argument?: AstExpression
  alternate?: AstExpression
  arguments?: AstExpression[]
  callee?: AstExpression
  consequent?: AstExpression
  elements?: Array<AstExpression | null>
  expressions?: AstExpression[]
  key?: AstExpression
  left?: AstExpression
  name?: string
  properties?: AstExpression[]
  quasis?: Array<{ value?: { raw?: string } }>
  right?: AstExpression
  test?: AstExpression
  value?: unknown
}

interface VueAttribute extends ESTree.Node {
  directive: boolean
  key?: {
    argument?: { name?: string }
    name?: string | { name?: string }
  }
  value?: {
    expression?: AstExpression
    value?: string
  }
}

interface VueParserServices {
  defineTemplateBodyVisitor: (visitor: {
    VAttribute: (node: VueAttribute) => void
  }) => Rule.RuleListener
}

const spacingUtility =
  /^(?:(?:m|p)(?:[trblxyse])?-.+|space-[xy]-.+|scroll-(?:m|p)(?:[trblxy])?-.+)$/
const inlineSpacingProperty = /^(?:margin|padding)(?:-|$)/i

function isSpacingUtility(token: string): boolean {
  let utility = token.split(':').at(-1) ?? token
  utility = utility.replace(/^!/, '').replace(/^-/, '').replace(/^!/, '')
  return spacingUtility.test(utility)
}

function isExpression(value: AstExpression | null | undefined): value is AstExpression {
  return value !== null && value !== undefined && typeof value.type === 'string'
}

function staticObjectKey(key: AstExpression | undefined): string | undefined {
  if (key?.type === 'Identifier') return key.name
  if (key?.type === 'Literal' && typeof key.value === 'string') return key.value
  return undefined
}

const noViewSpacingUtils: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow margin and padding utilities and inline styles in view components',
    },
    messages: {
      noViewSpacing:
        'View files must not define margin or padding ("{{utility}}"). Spacing is owned by layout components.',
    },
    schema: [],
  },
  create(context) {
    function report(node: ESTree.Node, utility: string) {
      context.report({
        node,
        messageId: 'noViewSpacing',
        data: { utility },
      })
    }

    function checkClassString(value: string, node: ESTree.Node) {
      for (const token of value.split(/\s+/).filter(Boolean)) {
        if (isSpacingUtility(token)) report(node, token)
      }
    }

    function checkStyleString(value: string, node: ESTree.Node) {
      for (const declaration of value.split(';')) {
        const property = declaration.split(':', 1)[0]?.trim()
        if (property && inlineSpacingProperty.test(property)) {
          report(node, `style: ${property}`)
        }
      }
    }

    function walkExpression(
      expression: AstExpression | null | undefined,
      node: ESTree.Node,
      onString: (value: string, node: ESTree.Node) => void,
      onObjectKey: (value: string, node: ESTree.Node) => void
    ) {
      if (!isExpression(expression)) return

      if (expression.type === 'Literal' && typeof expression.value === 'string') {
        onString(expression.value, node)
        return
      }

      if (expression.type === 'TemplateLiteral') {
        for (const quasi of expression.quasis ?? []) {
          if (quasi.value?.raw) onString(quasi.value.raw, node)
        }
        for (const part of expression.expressions ?? []) {
          walkExpression(part, node, onString, onObjectKey)
        }
        return
      }

      if (expression.type === 'ObjectExpression') {
        for (const property of expression.properties ?? []) {
          if (property.type === 'Property') {
            const key = staticObjectKey(property.key)
            if (key) onObjectKey(key, node)
            walkExpression(property.value as AstExpression, node, onString, onObjectKey)
          } else if (property.type === 'SpreadElement') {
            walkExpression(property.argument, node, onString, onObjectKey)
          }
        }
        return
      }

      if (expression.type === 'ArrayExpression') {
        for (const element of expression.elements ?? []) {
          walkExpression(element, node, onString, onObjectKey)
        }
        return
      }

      for (const child of [
        expression.argument,
        expression.alternate,
        expression.callee,
        expression.consequent,
        expression.left,
        expression.right,
        expression.test,
      ]) {
        walkExpression(child, node, onString, onObjectKey)
      }
      for (const child of expression.arguments ?? []) {
        walkExpression(child, node, onString, onObjectKey)
      }
      for (const child of expression.expressions ?? []) {
        walkExpression(child, node, onString, onObjectKey)
      }
    }

    const parserServices = context.sourceCode.parserServices as unknown as VueParserServices
    if (typeof parserServices.defineTemplateBodyVisitor !== 'function') return {}

    return parserServices.defineTemplateBodyVisitor({
      VAttribute(node) {
        const directiveName =
          typeof node.key?.name === 'string' ? node.key.name : node.key?.name?.name
        const argumentName = node.key?.argument?.name

        if (!node.directive && directiveName === 'class') {
          checkClassString(node.value?.value ?? '', node)
        } else if (!node.directive && directiveName === 'style') {
          checkStyleString(node.value?.value ?? '', node)
        } else if (node.directive && directiveName === 'bind' && argumentName === 'class') {
          walkExpression(node.value?.expression, node, checkClassString, checkClassString)
        } else if (node.directive && directiveName === 'bind' && argumentName === 'style') {
          walkExpression(node.value?.expression, node, checkStyleString, (property, reportNode) => {
            const cssProperty = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            if (inlineSpacingProperty.test(cssProperty)) {
              report(reportNode, `style: ${property}`)
            }
          })
        }
      },
    })
  },
}

export default noViewSpacingUtils
