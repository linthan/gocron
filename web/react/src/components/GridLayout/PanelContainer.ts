import { DashboardModel } from '../../core/dashboard/dashboard_model';

// tslint:disable-next-line:interface-name
export interface PanelContainer {
  getDashboard(): DashboardModel;
}
