import { PageComponent } from '@tramvai/react';
import { useStore } from '@tramvai/state';
import { FormActionResultStore } from '@tramvai/module-server';

export const MainPage: PageComponent = () => {
  const formActionData = useStore(FormActionResultStore);

  // TODO: временная JS-логика для примера, пока не сделан компонент Form
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const json = JSON.stringify(Object.fromEntries(formData));

    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: json,
    });

    console.log(response);
  };

  return (
    <div>
      <h1>Form Actions Example</h1>

      <p>Result from form action: {JSON.stringify(formActionData) ?? '-'}</p>

      <h2>Form with method POST, action on current URL</h2>
      <form method="POST" onSubmit={(event) => onSubmit(event)}>
        <fieldset>
          <legend>Form action response type</legend>
          <div>
            <label htmlFor="json">
              JSON Response{'\t'}
              <input type="radio" id="json" name="responseType" value="json" defaultChecked />
            </label>
          </div>
          <div>
            <label htmlFor="redirect">
              Redirect{'\t'}
              <input
                type="radio"
                id="redirect"
                name="responseType"
                value="redirect"
                defaultChecked
              />
            </label>
          </div>
        </fieldset>
        <br />

        <label htmlFor="username">
          Username{'\t'}
          <input type="text" name="username" id="username" />
        </label>

        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>

      <h2>Form with method GET, action on current URL</h2>
      <form method="GET" onSubmit={(event) => onSubmit(event)}>
        <label htmlFor="q">
          Search{'\t'}
          <input type="text" name="q" id="q" />
        </label>

        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>

      <h2>Form with method POST, action on another URL</h2>
      <form method="POST" action="/api/custom-form" onSubmit={(event) => onSubmit(event)}>
        <label htmlFor="name">
          Name{'\t'}
          <input type="text" name="name" id="name" />
        </label>

        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>

      <h2>Form with method GET, action on another URL</h2>
      <form method="GET" action="schema-validation" onSubmit={(event) => onSubmit(event)}>
        <label htmlFor="q">
          Search{'\t'}
          <input type="text" name="q" id="q" />
        </label>

        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default MainPage;
