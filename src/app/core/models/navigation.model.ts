export interface NavItem {
  label: string;
  icon: string;
  route: string;
  requiredPermission?: string;
  adminOnly?: boolean;
  children?: NavItem[];
}
