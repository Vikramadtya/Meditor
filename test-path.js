const resolvePath = (basePath, relativePath) => {
  try {
    relativePath = decodeURIComponent(relativePath);
  } catch (e) {}

  const parts = basePath.split(/[/\\]/);
  parts.pop(); // remove file name

  const relativeParts = relativePath.split("/");
  for (const part of relativeParts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
};

console.log(
  resolvePath(
    "/Users/test/Workspace/Course/Module/file.md",
    "../../../assets/images/image.png",
  ),
);
console.log(
  resolvePath("/Users/test/Workspace/Course/Module/file.md", "image.png"),
);
console.log(
  resolvePath("/Users/test/Workspace/Course/Module/file.md", "./image.png"),
);
