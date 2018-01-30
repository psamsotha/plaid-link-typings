

declare const Plaid: PlaidClient;

interface PlaidClient {
  create: (config: PlaidConfig) => PlaidLinkHandler;
}

interface PlaidLinkHandler {

  /**
   * Calling open will display the "Institution Select" view to your user, starting
   * the Link flow. Once open is called, you will begin receiving events via the
   * `onEvent` callback.
   */
  open: () => void;

  /**
   * The exit function allows you to programmatically close Link. Calling exit will
   * trigger either the `onExit` or `onSuccess` callbacks.
   * 
   * The exit function takes a single, optional argument, a configuration Object.
   * The configuration options are:
   * 
   * - `force`: If `true`, Link will exit immediately. If `false`, or the option is not
   *            provided, an exit confirmation screen may be presented to the user.
   */
  exit: (config?: { force: boolean; }) => void;
}

/**
 * The configuration for the Plaid client.
 */
export interface PlaidConfig {

  /**
   * Displayed once a user has successfully linked his or her Item.
   */
  clientName: string;

  /**
   * A list of Plaid product(s) you wish to use. Valid products are: transactions, auth, and identity.
   * Only institutions that support all requested products will be shown.
   * 
   * Example: ['auth', 'transactions']
   */
  product: string[];

  /**
   * The `public_key` associated with your account; available from the Plaid dashboard.
   */
  key: string;

  /**
   * The Plaid API environment on which to create user accounts. For development and testing,
   * use 'sandbox' or 'development'. For production use, use 'production'.
   *
   * Note: all 'production' requests are billed.
   */
  env: string;

  /**
   * A function that is called when a user has successfully onboarded an Item.
   * The function should expect two arguments, the `public_token` and a `Metadata` object.
   */
  onSuccess: (public_token: string, metadata: CallbackMetadata) => void;

  /**
   * A function that is called when a user has specifically exited the Link flow.
   * The function should expect two arguments, a nullable `error` object and a `Metadata` object.
   */
  onExit?: (link_session_id: string, error: PlaidError, metadata: CallbackMetadata) => void;

  /**
   * A function that is called when a user reaches certain points in the Link flow.
   * The function should expect two arguments, an `eventName` string and a `Metadata` object.
   */
  onEvent?: (eventName: 'ERROR'|'EXIT'|'HANDOFF'|'OPEN'|'SEARCH_INSTITUTION'|'SELECT_INSTITUTION'|'TRANSITION_VIEW',
             metadata: OnEventCallbackMetadata) => void;

  /**
   * A function that is called when the Link module has finished loading. Calls to
   * `plaidLinkHandler.open()` prior to the onLoad callback will be delayed until the module
   * is fully loaded.
   */
  onLoad?: () => void;

  /**
   * Specify a webhook to associate with an Item. Plaid fires a webhook when the Item requires
   * updated credentials or when new data is available.
   */
  webhook?: string;

  /**
   * Specify a public_token to launch Link in update mode for a particular Item.
   * This will cause Link to open directly to the authentication step for that Item's institution.
   */
  token?: string;

  /**
   * Set to true if launching Link within a WebView.
   */
  isWebview?: boolean;
}

interface CallbackMetadata {

  /**
   * A unique identifier associated with a user's actions and events through the Link flow.
   * Include this identifier when opening a support ticket for faster turnaround.
   */
  link_session_id: string;

  institution: {
    /**
     * The full institution name, such as 'Bank of America'.
     */
    name: string;
    /**
     * The institution ID, such as 'ins_100000'
     */
    institution_id: string;
  };

  accounts: Account[];
}

interface Account {
  /**
   * The id of the selected account.
   */
  id: string;

  /**
   * The name of the selected account.
   */
  name: string;

  /**
   * The account type.
   */
  type: string;

  /**
   * The account subtype.
   */
  subtype: string;
}

interface OnEventCallbackMetadata {

  /**
   * The error code that the user encountered. Emitted by: ERROR, EXIT events.
   */
  error_code: string;

  /**
   * The error message that the user encountered. Emitted by: ERROR, EXIT events.
   */
  error_message: string;

  /**
   * The error type that the user encountered. Emitted by: ERROR, EXIT events.
   */
  error_type: string;

  /**
   * The status key indicates the point at which the user exited the Link flow. Emitted by: EXIT event.
   */
  exit_status: string;

  /**
   * The ID of the selected institution. Emitted by: SELECT_INSTITUTION, OPEN events.
   */
  institution_id: string;

  /**
   * The name of the selected institution. Emitted by SELECT_INSTITUTION, OPEN events.
   */
  institution_name: string;

  /**
   * The query used to search for institutions. Emitted by: SEARCH_INSTITUTION event.
   */
  institution_search_query: string;

  /**
   * The link_session_id is a unique identifier for a single session of Link. It's always
   * available and will stay constant throughout the flow. Emitted by all events.
   */
  link_session_id: string;

  /**
   * If set, the user has encountered one of the following MFA types: code, device, questions,
   * selections. Emitted by: TRANSITION_VIEW event when view_name is MFA
   */
  mfa_type: string;

  /**
   * The request ID for the last request made by Link. This can be shared with Plaid Support
   * to expedite investigation. Emitted by all events
   */
  request_id: string;

  /**
   * An ISO 8601 representation of when the event occurred. For example 2017-09-14T14:42:19.350Z.
   * Emitted by all events.
   */
  timestamp: string;

  /**
   * The name of the view that is being transitioned to. Emitted by TRANSITION_VIEW event.
   */
  view_name: 'CONNECTED'|'CREDENTIAL'|'ERROR'|'EXIT'|'LOADING'|'MFA'|'SELECT_ACCOUNT'|'SELECT_INSTITUTION';
}

interface PlaidError {

  /**
   * A broad categorization of the error.
   */
  error_type: 'INVALID_REQUEST'|'INVALID_INPUT'|'RATE_LIMIT_EXCEEDED'|'API_ERROR'|'ITEM_ERROR';

  /**
   * The particular error code. Each error_type has a specific set of error_codes
   */
  error_code: string;

  /**
   * A developer-friendly representation of the error code.
   */
  error_message: string;

  /**
   * A user-friendly representation of the error code. null if the error is not related to user action. 
   */
  display_message: string;
}
