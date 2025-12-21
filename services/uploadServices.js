const uploadProductImages = (files, category) => {
  const uploadedFiles = files.map((file) => {
    const folderURI = `${process.env.BACKEND_URL}/public/images/${category}`;
    const fileURI = `${folderURI}/${file.filename}`;

    return {
      fileURI,
      fileSize: file.size,
      fileName: file.filename,
    };
  });

  return uploadedFiles;
};

export { uploadProductImages };
