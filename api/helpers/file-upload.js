const path = require("path");

module.exports = {
  friendlyName: "File upload",

  description: "To upload is user profile pic",

  inputs: {
    req: {
      friendlyName: "Request object",
      type: "ref",
    },

    res: {
      friendlyName: "Response object",
      type: "ref",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Uploaded file",
      description: "All done.",
    },

    fileNotUploaded: {
      description: "file not uploaded",
    },
  },

  fn: async function (inputs, exits) {
    const id = inputs.req.user.id;
    await inputs.req.file("file").upload(
      {
        // Directory path where you want to save...
        dirname: sails.config.appPath + "/assets/images/",
        saveAs: function (file, cb) {
          cb(
            null,
            inputs.req.user.username + "avatar" + path.extname(file.filename)
          );
        },
      },
      async function (err, file) {
        if (err) console.log(err);

        await User.update(
          { id: id },
          {
            profileImage:
              sails.config.appPath +
              "/assets/images/" +
              inputs.req.user.username +
              "avatar" +
              path.extname(file[0].filename),
          }
        );

        exits.success(file);
      }
    );
  },
};
