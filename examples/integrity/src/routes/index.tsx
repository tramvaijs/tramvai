import { useActions } from '@tramvai/state';
import { importAction } from '../actions/importAction';

export const MainPage = () => {
  const getData = useActions(importAction);

  return (
    <div>
      <h2>Main Page</h2>
      <button aria-label="button" type="button" id="button" onClick={getData}>
        Button
      </button>
    </div>
  );
};

export default MainPage;
