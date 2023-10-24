import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-select-customer',
  templateUrl: './select-customer.component.html',
  styleUrls: ['./select-customer.component.scss']
})
export class SelectCustomerComponent implements OnInit {

  resultadoPeticion: any;
  customers: any;
  selectedCustomer: any;

  public customerForm: FormGroup;

  constructor(private userService: UserService, private formBuilder: FormBuilder, 
    private cookiesService: CookieService, private dataService: DataService,
    private router: Router) {
      this.customerForm = new FormGroup({
      msCustomers: new FormControl("", [Validators.required]),
    });
    
  }

  ngOnInit(): void {

    this.userService.getUserCustomers().subscribe({
      next: data => {
        this.resultadoPeticion = data;

        if(this.resultadoPeticion.code == 200 || this.resultadoPeticion.code == 205){
          this.customers = this.resultadoPeticion.data;
        
        }else{
          this.router.navigate(["login"]); 
        }
      },
      error: error =>{
        console.error(error);
      }
      
    });
  }

  // function call on submit login form
  submitCustomerForm(customerFormValue: any) {
    if (this.customerForm.valid) {
      this.buttonContinueAction()
    }else{

    }
  };

  //method for error in select form
  public hasError = (controlName: string, errorName: string) => {
    return this.customerForm.controls[controlName].hasError(errorName);
  };

  buttonContinueAction(){
    this.selectedCustomer = this.customerForm.controls["msCustomers"].value;
    this.cookiesService.set('company', this.selectedCustomer.name, {path: "/dashboard"});
		this.cookiesService.set('idc', this.selectedCustomer.id, {path: "/dashboard"});
		this.cookiesService.set('code', this.selectedCustomer.code, {path: "/dashboard"});
		this.cookiesService.set('image', this.selectedCustomer.image, {path: "/dashboard"});

    this.notifyForChange();

    this.router.navigate(["home"]);
  }

  notifyForChange() {
    this.dataService.setCustomerNotifier(this.selectedCustomer);
  }

}
