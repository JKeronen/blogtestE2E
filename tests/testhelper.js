const loginWith = async (page, username, password)  => {
  await page.getByRole('button', { name: 'log in' }).click()
  await page.getByRole('textbox').first().fill(username)
  await page.getByRole('textbox').last().fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}
const createBlog = async (page, title,url) => {
  await page.getByRole('button', { name: 'add new blog' }).click()
  await page.getByRole('textbox').first().fill(title)
  await page.getByRole('textbox').last().fill(url)
  await page.getByRole('button', { name: 'add' }).click()
  // wait untill title appears to page
  await page.getByRole('heading' ,{name: title}).waitFor();
}
const logout = async (page)  => {
  await page.getByRole('button', { name: 'logout' }).click()
}
export { loginWith, createBlog, logout }