import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { GeneralDetails } from './components/general-details/general-details';
import { ApplicantBeneficiary } from './components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from './components/bank-details/bank-details';
import { InstructionsComponent } from './components/instructions/instructions';
import { Attachments } from './components/attachments/attachments';
import { Sidebar } from '../../../core/sidebar/sidebar';
import { SharedService } from '../../../core/services/user-service/shared-form-service/shared-service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-shipping-guarantee',
  standalone: true,
  imports: [
    CommonModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    InstructionsComponent,
    Attachments,
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuarantee implements AfterViewInit {

  currentStep = 0;

  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' }
  ];

  uploadedAttachments: File[] = [];

  @ViewChild(GeneralDetails) generalDetails!: GeneralDetails;
  @ViewChild(ApplicantBeneficiary) applicantBeneficiary!: ApplicantBeneficiary;
  @ViewChild(BankDetails) bankDetails!: BankDetails;
  @ViewChild(InstructionsComponent) instructions!: InstructionsComponent;
  @ViewChild(Attachments) attachmentsComponent!: Attachments;

  constructor(private router: Router, private sharedService: SharedService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const index = Array.from(sections).indexOf(entry.target as HTMLElement);
              this.currentStep = index;
            }
          }
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') }
      );
      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  next() {
    if (this.currentStep < this.shippingGuaranteeSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  back() {
    this.router.navigate(['/shipping-welcome']);
  }

  // ← NEW FUNCTION to capture files from Attachments component
  updateAttachments(files: File[]) {
    this.uploadedAttachments = files;
  }

  goToPreview() {
    const formData = {
      generalDetails: this.generalDetails?.form.value,
      applicantBeneficiary: this.applicantBeneficiary?.form.value,
      bankDetails: this.bankDetails?.form.value,
      instructions: this.instructions?.form.value,
      attachments: this.uploadedAttachments.length
        ? {
            files: this.uploadedAttachments,
            preview: this.uploadedAttachments.map(file => ({
              name: file.name,
              fileName: file.name,
              size: file.size,
              type: file.type,
              file: file
            }))
          }
        : { files: [], preview: [] }
    };

    this.sharedService.setFormData(formData);
    this.router.navigate(['/shipping-guarantee/preview']);
  }
}
