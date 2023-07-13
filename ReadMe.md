# StormCMS

StormCMS is a content management system (CMS) built using MongoDB, Node.js, Handlebars, and Express.js. It provides a simple and intuitive interface for managing and publishing content on an education site.

## Features in final release

- User authentication: StormCMS allows users to create an account, log in, and manage their content based on their roles and permissions.
- Content management: Users can create, edit, and delete various types of posts.
- WYSIWYG editor: StormCMS will integrate a rich text editor called TipTap that would enable users to format their content easily.
- Media management: StormCMS will provides a convenient way to upload, organize, and use media files, such as images and videos.
- Responsive design: The CMS will be designed to be mobile-friendly and provide a seamless user experience across different devices.

## Screenshots

*Will add l8r*

## Installation

To install and run StormCMS locally, follow these steps:

1. Clone the repository to your local directory:

   ```bash
   git clone https://github.com/aadilumair/StormCMS.git
   ```

2. Create a `.env` file in the root directory of the project and add the following variables:

   ```plaintext
   mongoURL=your-mongodb-url
   PORT=3000
   ```

   Replace `your-mongodb-url` with the URL of your MongoDB database.

3. Install the dependencies by running the following command in the terminal:

   ```bash
   npm install
   ```

4. Upload sample data to your MongoDB. Use the schema in the models folder to see how it should be organised. In the future, StormCMS will auto-populate the data.

5. Start the server using the following command:

   ```bash
   npm start
   ```

   The server will start running at the specified `PORT` in the `.env` file.

5. Open your web browser and navigate to `http://localhost:3000` (or the specified `PORT`).

6. You can now start using StormCMS to manage your website's content.

## Usage

Right now, the admin section is a broken mess and so is the visitor page. Don't expect to have features fully working yet. Explore as much as you want.

## Contribution

Contributions to StormCMS are welcome! If you find any issues or would like to add new features, feel free to submit a pull request.

## License

StormCMS is released under the NPOSL-3.0.

