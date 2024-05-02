const { loginWith, createBlog, logout } = require('./testhelper')
const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // before each test
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data:{
        name: 'Seppo Taalasmaa',
        username: 'staalasma',
        password: 'salainen'
      }      
    })
    await request.post('http://localhost:3003/api/users', {
      data:{
        name: 'Ismo Laitela',
        username: 'ilaitela',
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
      // Nothing to do here
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
      await expect(page.getByRole('heading', { name: 'Title: Title for testing' })).toBeVisible()
    })
    describe('Blog', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'Title for testing', 'Url for testing')
        await createBlog(page, 'Another title for testing', 'Second Url for testing')
      })
      test('like-button increases likes', async ({ page }) => {
        const blogDiv = page.getByText('Title: Another title for testing').locator('..') 
        await blogDiv.getByRole('button', { name: 'view'}).click();
        await page.getByRole('button', { name: 'like'}).click()
        await page.waitForTimeout(200);
        expect(page.getByText('Likes: 1')).toBeVisible();
      })
      test('"Remove Blog" removes the blog', async ({ page }) => {
        const blogDiv = page.getByText('Title: Another title for testing').locator('..') 
        await blogDiv.getByRole('button', { name: 'view'}).click();
        
        await page.waitForTimeout(200);
        page.on('dialog', async dialog => {
          expect(dialog.type()).toContain('confirm');
          expect(dialog.message()).toContain('Do you really want to remove blog?');
          await dialog.accept();
        })
        await page.getByRole('button', { name: 'Delete Blog'}).click();
        await page.waitForTimeout(200);
        expect(page.getByText('Title: Another title for testing')).not.toBeVisible();
      })
      test('If user not a owner, "Remove Blog"- button do not appear', async ({ page }) => {
        await logout(page);
        await expect(page.getByRole('button', {name: 'log in'})).toBeVisible();
        await loginWith(page, 'ilaitela', 'salainen')
        await expect(page.getByText('Ismo Laitela is logged in')).toBeVisible();
        const blogDiv = page.getByText('Title: Another title for testing').locator('..') 
        await blogDiv.getByRole('button', { name: 'view'}).click();
        await expect(page.getByRole('button', { name: 'Delete Blog'})).not.toBeVisible();
      })
      test('Blogs are sorted by likes, most liked first', async ({ page }) => {
        await expect(page.getByRole('form').nth(1).getByRole('heading', { name: 'Title: Another title for testing'})).toBeVisible();
        await page.locator('form').filter({ hasText: 'Title: Another title for testing' }).getByRole('button', {name: 'view'}).click();
        await page.getByRole('button', { name: 'like'}).click();
        await page.waitForTimeout(200)
        await expect(page.getByRole('form').nth(0).getByRole('heading', { name: 'Title: Another title for testing'})).toBeVisible();
      })
    })
  })
})