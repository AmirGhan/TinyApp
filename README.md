# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows user to shorten long URLs.

## Final Product

!["Screenshot of Home page"](https://github.com/AmirGhan/tiny-app/blob/master/docs/home-page.png?raw=true)
!["Screenshot of Registration page"](https://github.com/AmirGhan/tiny-app/blob/master/docs/registration-page.png?raw=true)
!["Screenshot of URLs page"](https://github.com/AmirGhan/tiny-app/blob/master/docs/urls-page.png?raw=true)
!["Screenshot of creating a new short link"](https://github.com/AmirGhan/tiny-app/blob/master/docs/create-new-link.png?raw=true)
!["Screenshot of updating/editing a url"](https://github.com/AmirGhan/tiny-app/blob/master/docs/updating-url.png?raw=true)
!["Screenshot of Login page"](https://github.com/AmirGhan/tiny-app/blob/master/docs/login-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- On the browser, go to `localhost:8080` to open the Home page.
- Click on "Register" to go to registration page. Make sure to fill out both "Email address" and "Password" sections.
- Then you will be on `/urls` page. There will be no list to show since you have not created any link.
- Go tp "Create a new link" and type in your long URL and click "submit". Don't forget to add "http://" before your long url.
- Then you will be redirected to `/urls` page showing shortened version of your URL.
- You can edit/update you link by clicking on "Edit" link.
- Also you can delete a link by clicking on the "Delete" button.
- To use your short url, copy and paste it after this link: `http://localhost:8080/u/` (i.e `http://localhost:8080/u/UFciim`).
- At the end, do not forget to logout.