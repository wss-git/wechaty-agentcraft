
export const getCookie = (cname: string) => {
  const name = cname + "=";
  const ca = document.cookie.split(';');
  console.log('ca: ', ca)
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return "";
}
