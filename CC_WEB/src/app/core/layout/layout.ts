import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { TopbarComponent } from "../topbar/topbar";
import { CommonModule } from '@angular/common';
import { MatMenuModule } from "@angular/material/menu";
import { filter } from 'rxjs/operators';


interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  open?: boolean;
   manualOpen?: boolean; //
}


@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    TopbarComponent,
    MatIconModule,
    RouterLinkWithHref,
    MatMenuModule
  ],
})
export class LayoutComponent implements OnInit {
Logout() {
 this.authService.logout();
 this.router.navigate(['/login']);
}


  currentMenu: 'DEFAULT' | 'SYSTEM' | 'MIDDLE' = 'DEFAULT';
  collapsed = false;
  shippingGuaranteeOpen = false;
  menuItems: MenuItem[] = [];


  systemOverviewMenu: MenuItem[] = [
    { label: 'Change Profile', route: '/system-overview/profile' },
    {
      label: 'Jurisdiction Maintenance',
      open: false,
      children: [
        { label: 'Roles', route: '/system-overview/jurisdiction-maintenance/role' },
        { label: 'Authorization', route: '/system-overview/jurisdiction-maintenance/authorization' },
      ]
    },
    {
      label: 'Customer Maintenance',
      open: false,
      children: [
        { label: 'Profiles', route: '/system-overview/customer-maintenance/customer-profile' },
        { label: 'Customer Entities', route: '/system-overview/customer-maintenance/customer-entities' },
        { label: 'User Profile', route: '/system-overview/customer-maintenance/user-profile' },
        { label: 'User Accounts', route: '/system-overview/customer-maintenance/user-accounts' }
      ]
    },
    {
      label: 'User Maintenance',
      open: false,
      children: [
        { label: 'Profiles', route: '/system-overview/customer-maintenance/customer-profile' },
        { label: 'Authentication', route: '/system-overview/customer-maintenance/authentication' },
      ]
    },
  ];


  middleOfficeMenu: MenuItem[] = [
    {
      label: 'Pending Approvals',
      open: false,
      children: [
        { label: 'List of Records', route: '/middle-office/pending-approvals/list-of-records' },
        { label: 'Edit Transaction', route: '/middle-office/pending-approvals/edit-transaction' },
        { label: 'Retrieve Unsigned', route: '/middle-office/pending-approvals/retrieve-unsigned' },
        { label: 'Pending Loans', route: '/middle-office/pending-approvals/pending-loans' },
        { label: 'Approve / Reject', route: '/middle-office/pending-approvals/approve-reject' },
        { label: 'Transactions', route: '/middle-office/pending-approvals/transactions' },
      ]
    },
    {
      label: 'Existing Records',
      open: false,
      children: [
        { label: 'List of Records', route: '/middle-office/existing-records/list-of-records' },
        { label: 'Edit Transaction', route: '/middle-office/existing-records/edit-transaction' },
        { label: 'Retrieve Unsigned', route: '/middle-office/existing-records/retrieve-unsigned' },
      ]
    }
  ];


  constructor(private router: Router, private authService: AuthService) { }


  ngOnInit() {
    const role = this.authService.getUserCategory();
    this.loadMenu(role);

this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {
    const url = event.urlAfterRedirects;
    this.activeRoute = url;

    if (url.includes('/system-overview')) {
      this.currentMenu = 'SYSTEM';
      this.menuItems = this.systemOverviewMenu;
    } else if (url.includes('/middle-office')) {
      this.currentMenu = 'MIDDLE';
      this.menuItems = this.middleOfficeMenu;
    } else {
      this.currentMenu = 'DEFAULT';
      const role = this.authService.getUserCategory();
      this.loadMenu(role);
    }

    // Open menus according to current route
    this.updateMenuOpenState(this.menuItems, url);
  });


  }


  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }


  isCollapsed(): boolean {
    return this.collapsed;
  }


  onParentClick(item: MenuItem) {
  if (item.route) {
    this.router.navigate([item.route]);
  }

  // Toggle children ONLY if there are children
  if (item.children) {
    item.open = !item.open;
  }
}


toggleMenu(item: MenuItem) {
  // Close all siblings
  this.menuItems.forEach(m => {
    if (m !== item) {
      this.closeAllChildren(m);
      m.open = false;
    }
  });

  // Toggle this item
  item.open = !item.open;
}

 
  loadMenu(role: 'ADMIN' | 'USER' | null) {
    if (role === 'ADMIN') {
      this.menuItems = [
        { label: 'System Features', icon: 'insights', route: '/system-overview' },
        { label: 'Middle-Office', icon: 'group', route: '/middle-office' },
        {
          label: 'Customers',
          icon: 'group',
          route: '/admin',              // <-- main Customers page
          open: false,
          children: [
            { label: 'Create New', route: '/admin/create-customer' },
             {label:'Inquiry', route:"/admin/customer-list"},
            
          ]
        },
     {
  label: 'Branch',
  icon: 'account_balance',      // ✅ Bank / Branch icon
  route: '/admin/branches',
  open: false,
  children: [
    { label: 'Create New', route: '/admin/create-branch' },
    { label: 'Inquiry', route: '/admin/branch-inquiry' }
  ]
},
{
  label: 'City',
  icon: 'location_city',        // ✅ Correct city icon
  route: '/admin/city',
  open: false,
  children: [
    { label: 'Create New', route: '/admin/city' },
    {label:'Inquiry',route:"/admin/city-inquiry"}
  ]
},
{
  label: 'Currency',
  icon: 'currency_exchange',
  route: '/admin/currency',
  open: false,
  children: [
    { label: 'Create New', route: '/admin/create-currency' },
    { label: 'Inquiry', route: '/admin/currency-inquiry' }
  ]
}

,
        { label: 'Users', icon: 'person', route: '/users' },
        {label:"Logout",icon:"logout",route:"/login"}
      ];


    } else {
      this.menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Search', icon: 'search', route: '/Search-by-id' },
        {
          label: 'Trade Services',
          icon: 'article',
          open: false,
          children: [


            // -------------------------
            // IMPORT LC
            // -------------------------
            {
              label: 'Import LC',
              route: '/import-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/import-screen' },
                { label: 'Amend', route: '/import-screen/amend' },
                { label: 'Inquiries', route: '/import-screen/inquiries' },
              ]
            },


            // -------------------------
            // EXPORT LC
            // -------------------------
            {
              label: 'Export LC',
              route: '/exportlc-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/export-screen' },
              ]
            },


            // -------------------------
            // SHIPPING GUARANTEE
            // -------------------------
            {
              label: 'Shipping Guarantee',
              route: '/shipping-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/shipping-guarantee' },
                { label: 'Amend', route: '/shipping-guarantee/amend' },
              ]
            },


            // -------------------------
            // EXPORT COLLECTION
            // -------------------------
            {
              label: 'Export Collection',
              route: '/export-collection-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/export-collection' },
                // If you add amend later, uncomment this:
                // { label: 'Amend', route: '/export-collection/amend' },
              ]
            },


            // -------------------------
            // UNDERTAKING ISSUANCE
            // -------------------------
            {
              label: 'Undertaking Issuance',
              route: '/undertaking-welcome',
              open: false,
              children: [
                { label: 'Create', route: '/undertaking-issuance' },
                { label: 'Amend', route: '/undertaking-issuance/amend' },
              ]
            },


          ],
        },


        { label: 'Settings', icon: 'settings', route: '/settings' },
        { label: 'Logout', icon: 'exit_to_app', route: '/login' }
      ];
    }
  }
  // Ameen function
  onCustomerClick(item: MenuItem) {
    const currentUrl = this.router.url;


    if (currentUrl.startsWith('/admin/create-customer')) {
      // Force navigation back to /admin
      this.router.navigateByUrl('/admin').then(() => {
        item.open = false; // close submenu
      });
    } else {
      // Normal toggle if not on "create customer"
      item.open = !item.open;
    }
  }


  // adding logout functionality 
 
  Logout() {
    this.authService.logout()
  }

  activeRoute: string = '';
isExactActive(route?: string): boolean {
  return !!route && this.activeRoute === route;
}

isAnyChildActive(item: MenuItem): boolean {
  return !!item.children?.some(child =>
    this.activeRoute.startsWith(child.route || '')
  );
}

isAnyGrandChildActive(item: MenuItem): boolean {
  return !!item.children?.some(child =>
    child.children?.some(sub =>
      this.activeRoute.startsWith(sub.route || '')
    )
  );
}




/**
 * Returns true if any grandchild (child's child) of the given item is active
 */


/**
 * Helper: check if item has any grandchild
 */
hasGrandChildren(item: MenuItem): boolean {
  return !!item.children?.some(child => child.children && child.children.length > 0);
}


/**
 * Automatically open parent/child menus if current route matches
 */
updateMenuOpenState(items: MenuItem[], url: string) {
  items.forEach(item => {
    if (item.children) {
      // Respect manualOpen first
      if (item.manualOpen !== undefined) {
        item.open = item.manualOpen;
      } else {
        // Open parent if any descendant (child or grandchild) is active
        item.open = this.isAnyDescendantActive(item);
      }

      item.children.forEach(child => {
        if (child.children) {
          if (child.manualOpen !== undefined) {
            child.open = child.manualOpen;
          } else {
            child.open = this.isAnyDescendantActive(child);
          }
        }
      });
    }
  });
}


// Check if any child or grandchild route is active
isAnyDescendantActive(item: MenuItem): boolean {
  if (!item.children) return false;

  return item.children.some(child =>
    this.activeRoute.startsWith(child.route || '') ||
    (child.children ? this.isAnyDescendantActive(child) : false)
  );
}


/**
 * Returns true if this item, any child, or any grandchild matches the active route
 */
// Currently active route

/**
 * Check if an item (parent/child) is active
 */
/**
 * Returns true if this item should be highlighted
 * - Parent active only if direct child is active
 * - Child active if route matches
 * - Grandchild active if route matches
 */
/**
 * Returns true if this item should be highlighted
 * level: 'parent' | 'child' | 'grandchild'
 */
isActive(item: MenuItem, level: 'parent' | 'child' | 'grandchild' = 'parent'): boolean {
  if (!item) return false;

  // Exact match
  if (item.route && this.activeRoute === item.route) return true;

  if (item.children) {
    if (level === 'parent') {
      // Parent is active ONLY if **direct child** matches route
      return item.children.some(child => child.route === this.activeRoute);
    }

    if (level === 'child') {
      // Child is active if its route matches OR any grandchild matches
      return item.route === this.activeRoute || item.children.some(sub => sub.route === this.activeRoute);
    }

    if (level === 'grandchild') {
      return item.route === this.activeRoute;
    }
  }

  return false;
}


/**
 * Child active check (used in template for nested submenu)
 */
isChildActive(item: MenuItem): boolean {
  if (!item.children) return false;

  return item.children.some(child => child.route === this.activeRoute);
}

/**
 * Grandchild active check
 */
isGrandChildActive(item: MenuItem): boolean {
  if (!item.children) return false;

  return item.children.some(child =>
    child.children?.some(sub => sub.route === this.activeRoute)
  );
}

/**
 * Check if a grandchild is active
 */

toggleMenuu(item: MenuItem) {
  // Close all sibling parents
  this.menuItems.forEach(m => {
    if (m !== item) {
      this.closeAllChildren(m);  // close their children recursively
      m.open = false;
    }
  });

  // Toggle this item
  item.open = !item.open;

  // If the parent is being closed, also close all its children
  if (!item.open) {
    this.closeAllChildren(item);
  }
}



// Toggle only this item, do NOT close siblings
// -----------------------------
toggleOnlyChildren(item: MenuItem) {
  // Simply toggle the item open state
  item.open = !item.open;

  // If the item is being closed, close all nested children
  if (!item.open) {
    this.closeAllChildren(item);
  }
}

// Recursive close function (you already have)
closeAllChildren(item: MenuItem) {
  if (!item.children) return;

  item.children.forEach(child => {
    child.open = false;
    if (child.children) {
      this.closeAllChildren(child);
    }
  });
}
// Navigate to route
goTo(item: MenuItem) {
  if (item.route) {
    this.router.navigate([item.route]);
  }
}
onChildClick(child: MenuItem, parent?: MenuItem) {
  if (child.route) {
    this.router.navigate([child.route]);
  }

  // Keep parent open
  if (parent) {
    parent.open = true;
  }

  // If child has grandchildren, toggle them
  if (child.children) {
    child.open = !child.open;
  }
}
}
