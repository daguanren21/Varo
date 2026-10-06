import type { Component } from 'vue'
import {
  VBadge as H5Badge,
  VButton as H5Button,
  VCell as H5Cell,
  VCellGroup as H5CellGroup,
  VCol as H5Col,
  VDialogClose as H5DialogClose,
  VDialogContent as H5DialogContent,
  VDialogOverlay as H5DialogOverlay,
  VDialogRoot as H5DialogRoot,
  VDialogTrigger as H5DialogTrigger,
  VDivider as H5Divider,
  VElevator as H5Elevator,
  VFixedNav as H5FixedNav,
  VGrid as H5Grid,
  VGridItem as H5GridItem,
  VImage as H5Image,
  VIndicator as H5Indicator,
  VInput as H5Input,
  VMenu as H5Menu,
  VMenuItem as H5MenuItem,
  VNavbar as H5Navbar,
  VOverlay as H5Overlay,
  VPagination as H5Pagination,
  VPopoverClose as H5PopoverClose,
  VPopoverContent as H5PopoverContent,
  VPopoverRoot as H5PopoverRoot,
  VPopoverTrigger as H5PopoverTrigger,
  VPopup as H5Popup,
  VRow as H5Row,
  VSideNavbar as H5SideNavbar,
  VSideNavbarItem as H5SideNavbarItem,
  VSpace as H5Space,
  VSticky as H5Sticky,
  VSwitch as H5Switch,
  VTab as H5Tab,
  VTabbar as H5Tabbar,
  VTabbarItem as H5TabbarItem,
  VTabs as H5Tabs,
} from '@varo-ui/h5'

export interface DemoRuntime {
  Badge: Component
  Button: Component
  Cell: Component
  CellGroup: Component
  DialogClose: Component
  DialogContent: Component
  DialogOverlay: Component
  DialogRoot: Component
  DialogTrigger: Component
  Divider: Component
  Elevator: Component
  FixedNav: Component
  Grid: Component
  GridItem: Component
  Image: Component
  Indicator: Component
  Input: Component
  Col: Component
  Menu: Component
  MenuItem: Component
  Navbar: Component
  Overlay: Component
  Pagination: Component
  Popup: Component
  PopoverClose: Component
  PopoverContent: Component
  PopoverRoot: Component
  PopoverTrigger: Component
  Row: Component
  SideNavbar: Component
  SideNavbarItem: Component
  Space: Component
  Sticky: Component
  Switch: Component
  Tabbar: Component
  TabbarItem: Component
  Tab: Component
  Tabs: Component
}

export const demoRuntime: DemoRuntime = {
  Badge: H5Badge,
  Button: H5Button,
  Cell: H5Cell,
  CellGroup: H5CellGroup,
  DialogClose: H5DialogClose,
  DialogContent: H5DialogContent,
  DialogOverlay: H5DialogOverlay,
  DialogRoot: H5DialogRoot,
  DialogTrigger: H5DialogTrigger,
  Divider: H5Divider,
  Elevator: H5Elevator,
  FixedNav: H5FixedNav,
  Grid: H5Grid,
  GridItem: H5GridItem,
  Image: H5Image,
  Indicator: H5Indicator,
  Input: H5Input,
  Col: H5Col,
  Menu: H5Menu,
  MenuItem: H5MenuItem,
  Navbar: H5Navbar,
  Overlay: H5Overlay,
  Pagination: H5Pagination,
  Popup: H5Popup,
  PopoverClose: H5PopoverClose,
  PopoverContent: H5PopoverContent,
  PopoverRoot: H5PopoverRoot,
  PopoverTrigger: H5PopoverTrigger,
  Row: H5Row,
  SideNavbar: H5SideNavbar,
  SideNavbarItem: H5SideNavbarItem,
  Space: H5Space,
  Sticky: H5Sticky,
  Switch: H5Switch,
  Tabbar: H5Tabbar,
  TabbarItem: H5TabbarItem,
  Tab: H5Tab,
  Tabs: H5Tabs,
}
