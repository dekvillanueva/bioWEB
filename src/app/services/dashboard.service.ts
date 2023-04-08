import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { API_URL, DASHBOARD_VIEW_EQUIPMENTS } from '../constants';
import { AppComponent } from '../app.component';
import { DataService } from 'src/app/services/data.service';




@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  config : any;
  serviceId : any;


  constructor(private http: HttpClient, private cookiesService: CookieService,
    private dataService: DataService){

    this.dataService.getCustomerNotifier().subscribe((value: Object) => {
      if (value) {
        this.serviceId = value;
        this.serviceId = this.serviceId.id;
      }
    });

    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    };
  }
  
  getEquipmentsByType(pid: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL + 'equipments/dashboard/types/' + pid, this.config);
	};

  getEquipmentServiceByType(serviceid:any, typeid:any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(DASHBOARD_VIEW_EQUIPMENTS +'/equipments-services.html?'+serviceid+'/types/'+typeid, this.config);
	};

  getEquipmentsByTypeGroup(){
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
    return this.http.get(API_URL + 'equipments/dashboard/group/types/', this.config);
  }

  getEquipmentByServicesGroupByType(pid: any){
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
    return this.http.get(API_URL + 'equipments/dashboard/service/' + pid + '/group/types/', this.config);
  }

  getUserEquipments() {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipments/dashboard/', this.config);
	};
  

  getServicesNumbers(serviceId: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
    
		return this.http.get(API_URL+'equipments/dashboard/services/' + serviceId, this.config);
	};

  getDashboardInventario() {
		let model = {param: "1", service: "TODOS"};
		return this.http.post("http://biotrust.helpro.com.ar/otrs-web/biotrust/api/v1/eqiupos/getTaller.php", model);
	};

  getEquipmentTypeEquivalenceList() {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipment-type-equivalences/list/', this.config);
	};

  getBrandsByEquipmentTypeList(id: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipment-types/'+id+'/brand/list/', this.config);
	};

  getModelByTypeEquivalenceBrand(brand: any, type: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'models/brand/'+brand+'/type-equi/'+ type, this.config);
	};

  getEquipmentSerialsByParameters(tipoId: any, marcaId: any, modeloId: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipments/search/serial/customer/'+this.serviceId+
                          '/type/'+tipoId+'/brand/'+marcaId+
                          '/model/'+modeloId, this.config);
	};

  getEquipmentByServicesGroupByTypeCertPend(pid: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipments/dashboard/service/'+pid+'/group/types/certpend/', this.config);
	};

  getEquipmentByServicesGroupByTypeCert(pid: any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipments/dashboard/service/'+pid+'/group/types/cert/', this.config);
	};

  getTracesByEquipment (pid : any) {
    this.config = {
      headers: {
        'AUTH': this.cookiesService.get("token"),
        'SID': this.cookiesService.get('uid'),
        'CID': this.serviceId
      }
    }
		return this.http.get(API_URL+'equipments/trace/'+pid, this.config);
	};

}
