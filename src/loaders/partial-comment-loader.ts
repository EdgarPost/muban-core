/**
 * Adds html comments around the partial so it's easily findable
 */
export default function(this: any, content) {
  // tslint:disable-next-line no-this-assignment
  const loaderContext = this;

  const done = this.async();
  this.cacheable();

  loaderContext.resolve(loaderContext.context, loaderContext.resourcePath, (_, partialName) => {
    // extract and normalize path separators
    const shortPartialName = partialName.split(/src[\\/](app[\\/])?/)[2].replace(/[/\\]/g, '/');

    const newContent = `
<!-- partial: ${shortPartialName} -->
${content.replace(/\s+$/, '')}
<!-- / ${shortPartialName} -->
`;

    done(null, newContent);
  });
}
