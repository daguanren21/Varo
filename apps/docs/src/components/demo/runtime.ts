import type { Component } from 'vue'
import type { Platform } from './types'
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
  VPopup as H5Popup,
  VRow as H5Row,
  VSideNavbar as H5SideNavbar,
  VSideNavbarItem as H5SideNavbarItem,
  VSpace as H5Space,
  VSticky as H5Sticky,
  VTab as H5Tab,
  VTabbar as H5Tabbar,
  VTabbarItem as H5TabbarItem,
  VTabs as H5Tabs,
} from '@varo-ui/h5'
import {
  VBadge as WeappBadge,
  VButton as WeappButton,
  VCell as WeappCell,
  VCellGroup as WeappCellGroup,
  VCol as WeappCol,
  VDialogClose as WeappDialogClose,
  VDialogContent as WeappDialogContent,
  VDialogOverlay as WeappDialogOverlay,
  VDialogRoot as WeappDialogRoot,
  VDialogTrigger as WeappDialogTrigger,
  VDivider as WeappDivider,
  VElevator as WeappElevator,
  VFixedNav as WeappFixedNav,
  VGrid as WeappGrid,
  VGridItem as WeappGridItem,
  VImage as WeappImage,
  VIndicator as WeappIndicator,
  VInput as WeappInput,
  VMenu as WeappMenu,
  VMenuItem as WeappMenuItem,
  VNavbar as WeappNavbar,
  VOverlay as WeappOverlay,
  VPagination as WeappPagination,
  VPopup as WeappPopup,
  VRow as WeappRow,
  VSideNavbar as WeappSideNavbar,
  VSideNavbarItem as WeappSideNavbarItem,
  VSpace as WeappSpace,
  VSticky as WeappSticky,
  VTab as WeappTab,
  VTabbar as WeappTabbar,
  VTabbarItem as WeappTabbarItem,
  VTabs as WeappTabs,
} from '@varo-ui/weapp'

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
  Row: Component
  SideNavbar: Component
  SideNavbarItem: Component
  Space: Component
  Sticky: Component
  Tabbar: Component
  TabbarItem: Component
  Tab: Component
  Tabs: Component
}

const h5Runtime: DemoRuntime = {
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
  Row: H5Row,
  SideNavbar: H5SideNavbar,
  SideNavbarItem: H5SideNavbarItem,
  Space: H5Space,
  Sticky: H5Sticky,
  Tabbar: H5Tabbar,
  TabbarItem: H5TabbarItem,
  Tab: H5Tab,
  Tabs: H5Tabs,
}

const weappRuntime: DemoRuntime = {
  Badge: WeappBadge,
  Button: WeappButton,
  Cell: WeappCell,
  CellGroup: WeappCellGroup,
  DialogClose: WeappDialogClose,
  DialogContent: WeappDialogContent,
  DialogOverlay: WeappDialogOverlay,
  DialogRoot: WeappDialogRoot,
  DialogTrigger: WeappDialogTrigger,
  Divider: WeappDivider,
  Elevator: WeappElevator,
  FixedNav: WeappFixedNav,
  Grid: WeappGrid,
  GridItem: WeappGridItem,
  Image: WeappImage,
  Indicator: WeappIndicator,
  Input: WeappInput,
  Col: WeappCol,
  Menu: WeappMenu,
  MenuItem: WeappMenuItem,
  Navbar: WeappNavbar,
  Overlay: WeappOverlay,
  Pagination: WeappPagination,
  Popup: WeappPopup,
  Row: WeappRow,
  SideNavbar: WeappSideNavbar,
  SideNavbarItem: WeappSideNavbarItem,
  Space: WeappSpace,
  Sticky: WeappSticky,
  Tabbar: WeappTabbar,
  TabbarItem: WeappTabbarItem,
  Tab: WeappTab,
  Tabs: WeappTabs,
}

export function getDemoRuntime(platform: Platform): DemoRuntime {
  return platform === 'weapp' ? weappRuntime : h5Runtime
}
