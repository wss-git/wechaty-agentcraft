import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import history from 'history/browser';

import Login from './page/Login';
import Home from './page/Home';
import { useEffect } from 'react';

function CustomRouters() {
  const navigate = useNavigate();
  useEffect(() => {
    const unlisten = history.listen(({ location, action }) => {
      // @ts-ignore
      if (action === 'PUSH' && location.pathname === '/login' && location.state?.fetchStatus === 403) {
        navigate(location.pathname)
      }
    });

    return () => unlisten();
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/users">
            <Route index element={<UsersList />} />
            <Route path=":userId" element={<UserDetails />} />
          </Route> */}
      {/* 未匹配路由的兜底组件 */}
      {/* <Route path="*" element={<NotFound />} />  */}
    </Routes>
  )
}

function App() {
  return (
    <div style={{ height: '100%' }}>
      <Router>
        <CustomRouters />
      </Router>
    </div>
  );
}

export default App;
