import type { PageComponent } from '@tramvai/react';
import { useStore } from '@tramvai/state';
import { FormActionResultStore } from '@tramvai/module-server';

export const SchemaValidationPage: PageComponent = () => {
  const formActionData = useStore(FormActionResultStore);

  return (
    <div>
      <h1>Form with Schema Validation</h1>
      <p>This form demonstrates JSON schema validation in a form action.</p>
      <p>Result from form action: {JSON.stringify(formActionData) ?? '-'}</p>

      <form method="POST">
        <div>
          <label htmlFor="name">
            Name (2-50 characters){'\t'}
            <input type="text" id="name" name="name" />
          </label>
        </div>

        <div>
          <label htmlFor="email">
            Email{'\t'}
            <input type="text" id="email" name="email" />
          </label>
        </div>

        <div>
          <label htmlFor="age">
            Age (18-120){'\t'}
            <input type="text" id="age" name="age" />
          </label>
        </div>

        <div>
          <label htmlFor="subscribe">
            Subscribe to newsletter{'\t'}
            <input type="checkbox" id="subscribe" name="subscribe" />
          </label>
        </div>

        <button type="submit">Submit</button>
      </form>

      <h2>Validation Rules</h2>
      <ul>
        <li>Name: Required, 2-50 characters</li>
        <li>Email: Required, must be a valid email format</li>
        <li>Age: Required, must be between 18 and 120</li>
        <li>Subscribe: boolean</li>
      </ul>
    </div>
  );
};

export default SchemaValidationPage;
