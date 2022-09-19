import React from 'react';
import { FormattedMessage } from 'umi';

type TErrorBoundaryState = {
  hasError: boolean;
  error?: any;
};

class ErrorBoundary extends React.Component<any, TErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  // componentDidCatch(error, errorInfo) {
  //   // You can also log the error to an error reporting service
  //   logErrorToMyService(error, errorInfo);
  // }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      // eslint-disable-next-line no-console
      console.error(`Something went wrong when render component:${error}`);
      return (
        <div className="error-boundary-wrapper">
          <img src="/error.png" alt="error-boundary-img" />
          <FormattedMessage id="component.cracked" />
        </div>
      );
    }

    return this.props.children;
  }
}

function withCatchError(WrapperComponent: any) {
  class HOC extends React.Component<any, TErrorBoundaryState> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, error };
    }

    render() {
      const {
        state: { hasError, error },
        props,
      } = this;
      if (hasError) {
        // eslint-disable-next-line no-console
        console.error(`Something went wrong when render component:${error}`);
        return (
          <div className="error-boundary-wrapper">
            <img src="/error.png" alt="error-boundary-img" />
            <FormattedMessage id="component.cracked" />
          </div>
        );
      }
      return <WrapperComponent {...props} />;
    }
  }
  return HOC;
}

export default withCatchError;
export { ErrorBoundary };
