// Runs before `next build` so a content error is reported plainly, before any compile output.
import("../lib/content/load")
  .then(({ content }) => {
    console.log(
      `content ok: ${content.rebates.programs.length} rebate programs, ${content.pricing.tiers.length} pricing tiers, ` +
        `${content.styles.styles.length} styles, ${content.plants.plants.length} plants`,
    );
  })
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
