const { loginWith, createBlog } = require('./testhelper')
const { test, expect, beforeEach, describe } = require('@playwright/test')


describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data:{
        name: 'Seppo Taalasmaa',
        username: 'staalasma',
        password: 'salainen'
      }      
    })

    await page.goto('http://localhost:5173')
  })

  test('Login button is shown', async ({ page }) => {
    
    await expect (page.getByRole('button', {name: 'log in'})).toBeVisible()

  })
  describe('Login', () => {
    beforeEach(async ({ page, request }) => {

     })
    test('succeeds with correct credentials', async ({ page }) => {
      
      await loginWith(page, 'staalasma', 'salainen')
      await expect(page.getByText('Seppo Taalasmaa is logged in')).toBeVisible()
     
    })
    test('succeeds with wrong credentials', async ({ page }) => {
      
      await loginWith(page, 'staalasma', 'wrongpassword')
      await expect(page.getByText('Seppo Taalasmaa is logged in')).not.toBeVisible()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'staalasma', 'salainen')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Title for testing', 'Url for testing')
      await createBlog(page, 'Another title for testing', 'Second Url for testing')
      expect(await page.getByRole('heading', { name: 'Title: Title for testing' })).toBeVisible()
      //await locator('form').filter({ hasText: 'Title: Title for testing' }).toBeVisible()
      //await expect (page.getByText('Title: Title for testingview')).toBeVisible()
      
    })
  })
})