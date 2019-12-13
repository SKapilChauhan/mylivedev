let port = window.location.port;
let is_cors = port == '3000' ? true : false;
//是否跨域
let mode = is_cors ? 'cors' : 'no-cors';
//是否带cookie
let credentials = is_cors ? 'same-origin' : 'include';
const app = {
	server_url: '',
	mode: mode,
	credentials: credentials
};
export default app;
