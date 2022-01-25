export enum CustomErrorCode {
  RefundRequestTypeDecoderFailed,
  RefundRequestAmountInvalid,
  RefundRequestSignatureInvalid,
  RefundRequestExpired,
  RefundRequestParaIdInvalid,
  NoEnoughRefundBalance,
  RefundRequestReferralCodeInvalid,
  SameRefundActionAlreadyExists,
  NoIdsInGetRefundActions,
  GetRefundInformationFailed,
  SaveRefundActionFailed,
  ValidateSignatureFailed,
  CheckAvailableRefundBalanceFailed,
  DuplicatedRefundActions,
  CheckRefundActionExistsFailed,
  AddressInValid
}

export const errorMessageMapping = {
  [CustomErrorCode.RefundRequestTypeDecoderFailed]: 'Invalid Request body',
  [CustomErrorCode.RefundRequestAmountInvalid]: 'Invalid amount',
  [CustomErrorCode.RefundRequestSignatureInvalid]: 'Invalid signature',
  [CustomErrorCode.RefundRequestParaIdInvalid]: 'Invalid paraId',
  [CustomErrorCode.NoEnoughRefundBalance]: 'Not enough refund balance',
  [CustomErrorCode.RefundRequestReferralCodeInvalid]: 'Invalid referral code',
  [CustomErrorCode.SameRefundActionAlreadyExists]: 'Refund action already exists',
  [CustomErrorCode.GetRefundInformationFailed]: 'Failed when getting refund information',
  [CustomErrorCode.SaveRefundActionFailed]: 'Failed when saving refund action',
  [CustomErrorCode.ValidateSignatureFailed]: 'Failed when validating signature',
  [CustomErrorCode.CheckAvailableRefundBalanceFailed]: 'Failed when check available refund balance',
  [CustomErrorCode.DuplicatedRefundActions]: 'Multiple same actions found',
  [CustomErrorCode.CheckRefundActionExistsFailed]: 'Failed when checking if action exists',
  [CustomErrorCode.NoIdsInGetRefundActions]: 'No ids in request for getting refund actions',
  [CustomErrorCode.RefundRequestExpired]: 'Refund action request expired for 5 mins',
  [CustomErrorCode.AddressInValid]: 'Account is invalid'
};

export class CustomError {
  public code;
  public message;

  constructor(code: CustomErrorCode) {
    this.code = code;
    this.message = errorMessageMapping[code];
  }
}

export class CustomBadRequestError extends CustomError {
  public payload;
  constructor(code: CustomErrorCode, payload?: Record<string, any>) {
    super(code);
    this.payload = payload;
  }
}

export class CustomInternalServerError extends CustomError {
  public err;

  constructor(code: CustomErrorCode, err: any) {
    super(code);
    this.err = err;
  }
}
