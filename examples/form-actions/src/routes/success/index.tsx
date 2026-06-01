import { PageComponent } from '@tramvai/react';

export const SuccessPage: PageComponent = () => {
  return (
    <div>
      <h1>Success!</h1>
      <p>You have been redirected to this page.</p>
      <a href="/">Go back to home</a>
    </div>
  );
};

export default SuccessPage;
