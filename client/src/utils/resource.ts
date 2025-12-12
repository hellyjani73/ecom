export const BaseError = {
  Required: ' is required',
  NumberOnly: ' accepts numeric value only',
  Select: 'Please select ',
};

export const ValidationMessage = {
  // Required
  EmailRequired: `Email ${BaseError.Required}`,
  PasswordRequired: `Password ${BaseError.Required}`,
  CurrentPasswordRequired: `Current password ${BaseError.Required}`,
  NewPasswordRequired: `New password ${BaseError.Required}`,
  PasswordNumberRequired: 'Password must have at least 1 number',
  PasswordSpecialCharacterRequired: 'Password must have at least 1 special character',
  PasswordMinLengthValidation: 'Password must be minimum 10 characters',
  PasswordLowercaseValidation: 'Password must have at least 1 lowercase letter',
  PasswordUppercaseValidation: 'Password must have at least 1 uppercase letter',
  PasswordRequirementNotMatchValidation:
    'Use 10 or more characters with a mix of 1 uppercase, 1 lowercase, 1 number & 1 symbol',
  ConfirmPasswordRequired: 'Please confirm password',
  NameRequired: `Name ${BaseError.Required}`,
  FirstNameRequired: `First name ${BaseError.Required}`,
  LastNameRequired: `Last name ${BaseError.Required}`,

  // Success
  SignInSuccess: 'You have successfully logged in',
  ProfileAcceptedSuccess: 'Profile is accepted!',
  ProfileRejectedSuccess: 'Profile is rejected!',
  ProfileUnderReviewSuccess: 'Profile is under review!',
  ProfileAvailableSuccess: 'Profile has been marked as available for matching',
  ProfileNotAvailableSuccess: 'Profile has been marked as not available for matching',
  InviteProfessionalsSuccess: 'Product has been invited to selected pros',

  ReferenceReminderColleagueSuccess:
    'Reference reminder email has been successfully sent to colleague',
  ReferenceReminderCharacterSuccess:
    'Reference reminder email has been successfully sent to character',
  ChangePasswordSuccess: 'You have successfully changed your password',
  ReferenceEmailUpdateSuccess: 'Reference email has been updated successfully',
  SignupConfirmationLinkCopySuccess: 'Signup confirmation link copied',
  ProjectMarkAsClosedSuccess: 'Project has been successfully mark as closed',
  UserDisabledSuccess: 'User has been successfully disabled',
  UserRestoreSuccess: 'User profile has been successfully restored',

  // Invalid
  InvalidCredentials: 'Invalid username or password',
  CommonCatchError: 'Something went wrong',
  InvalidEmail: 'Email is not valid',
  InvalidConfirmPassword: 'Both password fields must be the same to continue',
  SomethingWentWrong: 'Something went wrong! Please try again after sometime',
  ReferenceEmailSameAsCurrentEmail: 'Email should not be the same as current email',
  ReferenceEmailSameAsOtherReferenceEmail: 'Email should not be the same as other references',
  ReferenceEmailSameAsProfessionalEmail: "You can't enter professional's business email",
  InvalidReferenceName: 'Name must be a valid name',
  InvalidReferenceFirstName: 'First name must be a valid name',
  InvalidReferenceLastName: 'Last name must be a valid name',
  AccountNotExistError: 'Please enter a valid email',
  ProjectMarkAsClosedError: 'Unable to mark the project as closed',
  UserDisabledError: 'Unable to disable the User',

  // Password Strength Messages
  PasswordStrengthMinLength: 'Must be minimum 10 characters',
  PasswordStrengthUppercase: 'Must have at least 1 uppercase letter',
  PasswordStrengthLowercase: 'Must have at least 1 lowercase letter',
  PasswordStrengthNumber: 'Must have at least 1 number',
  PasswordStrengthSpecialCharacter: 'Must have at least 1 special character',

};

export const Messages = {
  ProfileActionDialogTitle: 'Confirmation',
};
