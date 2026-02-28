let _openActivateDialog: (() => void) | null = null;
let _isLoggedIn = false;
let _showLoginDialog: (() => void) | null = null;

export function setPremiumToastHelpers(isLoggedIn: boolean, openDialog: () => void, showLoginDialog: () => void) {
  _isLoggedIn = isLoggedIn;
  _openActivateDialog = openDialog;
  _showLoginDialog = showLoginDialog;
}

export function showPremiumToast() {
  if (_isLoggedIn && _openActivateDialog) {
    _openActivateDialog();
    return;
  }

  if (_showLoginDialog) {
    _showLoginDialog();
  }
}
