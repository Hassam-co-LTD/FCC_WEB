import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  Location,
  CommonModule
} from '@angular/common';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


import Swal from 'sweetalert2';

import { ApiService } from '../../../../../core/services/api.service';



@Component({

  selector: 'app-permission-master',

  standalone: true,

  imports: [

    CommonModule,

    ReactiveFormsModule,

    MatFormFieldModule,

    MatInputModule,

    MatSelectModule,

    MatIconModule,

    MatButtonModule

  ],

  templateUrl: './permissions-group.html',

  styleUrls: ['./permissions-group.scss']

})


export class PermissionGroup implements OnInit {


  permissionsFormGroup!: FormGroup;


  storePermissionGroup: any = null;


  isEditMode = false;


  isOpen = true;



  constructor(

    private fb: FormBuilder,

    private api: ApiService,

    private router: Router,

    private route: ActivatedRoute,

    private location: Location

  ) {}





  ngOnInit(): void {


    this.buildForm();


    this.loadPermissionGroup();


    this.getPermissionGroups();


  }







  // =========================
  // FORM CREATION
  // =========================


  private buildForm(): void {


    this.permissionsFormGroup = this.fb.group({


      permissionGroupId: [

        ''

      ],



      permissionGroupName: [

        '',

        Validators.required

      ],

       permissionId: [
      '',
      Validators.required
    ],




      permissionGroupStatus: [

        'A',

        Validators.required

      ],



      description: [

        ''

      ]



    });


  }







  // =========================
  // LOAD DATA FOR EDIT
  // =========================


  private loadPermissionGroup(): void {


    const id = this.route.snapshot.paramMap.get('id');



    console.log(
      'Permission Group ID:',
      id
    );



    if(id){


      this.isEditMode = true;



      this.api
      .getTnxById(
        id,
        'PermissionsGroup'
      )

      .subscribe({


        next:(res)=>{


          console.log(
            'Permission Group:',
            res
          );



          this.storePermissionGroup = res;



          this.permissionsFormGroup.patchValue(res);



        },



        error:(err)=>{


          console.error(
            'Load failed',
            err
          );


        }



      });



    }



  }







  // =========================
  // SAVE
  // =========================


  onSave():void {


    if(this.permissionsFormGroup.invalid){

      return;

    }



    const payload =
    this.permissionsFormGroup.getRawValue();



    console.log(
      'Save Payload:',
      payload
    );



    this.api
    .saveTnx(
      payload,
      'PermissionsGroup'
    )

    .subscribe({


      next:()=>{


        Swal.fire(

          'Saved!',

          'Permission group saved successfully',

          'success'

        )
        .then(()=>{


          this.router.navigate(
            ['/admin/permission-master-inquiry']
          );


        });



      },



      error:(err)=>{


        console.error(
          'Save Error',
          err
        );



        const message =

        err.error?.message ??

        err.error ??

        'Something went wrong';



        Swal.fire(

          'Error',

          message,

          'error'

        );



      }


    });



  }







  // =========================
  // UPDATE
  // =========================


  update(id:number):void {


    if(this.permissionsFormGroup.invalid){

      return;

    }



    const payload =
    this.permissionsFormGroup.getRawValue();



    this.api

    .updateTnx(

      payload,

      'PermissionsGroup',

      id

    )

    .subscribe({


      next:()=>{


        Swal.fire(

          'Updated!',

          'Permission group updated successfully',

          'success'

        )

        .then(()=>{


          this.router.navigate(
            ['/admin/permission-master-inquiry']
          );


        });



      },



      error:(err)=>{


        console.error(
          'Update failed',
          err
        );


      }


    });



  }








  // =========================
  // READ ONLY LOGIC
  // =========================


  isReadOnly():boolean {


    return (
      this.storePermissionGroup?.recordStatus === 'A'
    );


  }







  // =========================
  // COLLAPSE
  // =========================


  toggle():void {


    this.isOpen =
    !this.isOpen;


  }







  onBack():void {


    this.location.back();


  }







  onCancel():void {


    this.permissionsFormGroup.reset({

      permissionGroupStatus:'A'

    });


  }








  // =========================
  // SUBMIT
  // =========================


  submit():void {


    this.changeStatus(

      'S',

      'Submitted!',

      'Permission group submitted successfully'

    );


  }








  // =========================
  // REJECT
  // =========================


  reject():void {


    this.changeStatus(

      'I',

      'Rejected!',

      'Permission group rejected successfully'

    );


  }








  // =========================
  // APPROVE
  // =========================


  approve():void {


    this.changeStatus(

      'A',

      'Approved!',

      'Permission group approved successfully'

    );


  }








  // =========================
  // AMEND
  // =========================


  amend(id:number):void {


    this.changeStatus(

      'I',

      'Amended!',

      'Permission group moved to draft'

    );


  }








  // =========================
  // COMMON STATUS METHOD
  // =========================


  private changeStatus(

    status:string,

    title:string,

    message:string

  ):void {



    const id =
    this.storePermissionGroup?.permissionGroupId;



    if(!id){

      return;

    }




    this.api

    .setTnxByStatus(

      status,

      id,

      'PermissionsGroup'

    )

    .subscribe({


      next:()=>{


        Swal.fire(

          title,

          message,

          'success'

        )

        .then(()=>{


          this.router.navigate(

            ['/admin/permission-master-inquiry']

          );


        });



      },



      error:(err)=>{


        console.error(

          'Status update failed',

          err

        );


      }



    });



  }








  // =========================
  // GET LIST
  // =========================
storePermissionGroups: any[] = [];


getPermissionGroups(): void {


  this.api
    .getAllTnx('Permissions')

    .subscribe({

      next: (res: any) => {


        console.log(
          'Permission Groups Response:',
          res
        );


        this.storePermissionGroups =
          Array.isArray(res)
            ? res
            : res?.data ?? [];



      },


      error: (err) => {


        console.error(
          'Permission Groups load failed',
          err
        );


        this.storePermissionGroups = [];


      }


    });


}


}