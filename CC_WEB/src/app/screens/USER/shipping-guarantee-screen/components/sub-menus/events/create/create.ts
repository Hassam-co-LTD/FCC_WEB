import { AfterViewInit, Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Import your section components
import { GeneralDetails } from '../../../general-details/general-details';
import { ApplicantBeneficiary } from '../../../applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from '../../../bank-details/bank-details';
import { InstructionsComponent } from '../../../instructions/instructions';
import { AttachmentsDocuments } from '../../../attachments/attachments';
import { Preview } from '../../../preview/preview';
@Component({
  selector: 'create',
  standalone: true,
  imports: [
    ReactiveFormsModule
],
  templateUrl: './create.html',
  styleUrls: ['./create.scss']
})
export class create implements OnInit, AfterViewInit {
  currentStep = 0;
  activeSection: string | null = 'create';

  constructor(private router: Router, private route: ActivatedRoute) {}
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    // Optional: open a specific section from query param
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) this.activeSection = section;
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  scrollToSection(i: number) {
    const el = document.getElementById(`section-${i}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
