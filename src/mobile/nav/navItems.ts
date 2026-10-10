export interface NavItem {
  key: string
  labelKey: string
  to: string
  iconPath: string
}

// New module = one entry here + one route in mobile/router/routes.ts.
// TODO(Step 20): add a permission key per item and filter by it.
export const navItems: NavItem[] = [
  {
    key: 'water',
    labelKey: 'nav.waterQuality',
    to: '/m/water',
    iconPath: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  },
]
