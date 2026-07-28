# SEO Image Optimization Report

Generated on 2026-07-28.

## Summary

- Public HTML images reviewed: 522
- Images missing alt attributes: 0
- Decorative/repeated images with empty alt: 228
- Images with explicit width and height: 517
- Local images still missing width/height: 0
- External Microsoft Store/CDN images missing width/height: 5

## Images corrected

- Added or normalized descriptive alt text for app screenshots from `data/apps-seo.json`.
- Added width and height attributes for local PNG, JPEG, and SVG images where dimensions could be detected.
- Kept repeated decorative icons beside visible app names as `alt=""`.
- Removed the broken Puzzle Fuzzle gallery reference to `screenshots/screenshot-4.png` because the file content is XML/MPD rather than a displayable image.
- Removed empty `<img src="">` placeholders from generated pages.

## Images renamed

No image files were renamed. The existing screenshot paths are already referenced across many static pages, so keeping file names avoids unnecessary URL churn and broken references.

## Images converted or resized

No screenshots were converted to WebP/AVIF or resized in this pass. The current screenshots remain as the project provides them so product visuals are not degraded without design review.

## Images with new alt text

Screenshot alt text now follows the pattern `[App Name] [visible screenshot caption] on Windows`, using captions already present in the project.

## Decorative images

Decorative or repeated app icons beside visible app names use empty alt text where appropriate, including homepage catalog icons and related app icons.

## Large local images remaining

- No local screenshot over 600 KB was found in the model inventory.

## External image limitations

- apps/otp-password-manager-pro/index.html: https://store-images.s-microsoft.com/image/apps.36914.14093099495542792.09445a70-e9c2-4d21-ba3e-16466524684d.5179799d-314e-48dc-8706-4990bbd90381
- apps/otp-password-manager-pro/index.html: https://store-images.s-microsoft.com/image/apps.48224.14093099495542792.09445a70-e9c2-4d21-ba3e-16466524684d.c104d267-7a5f-4dec-973f-efc29d93c5e2
- apps/otp-password-manager-pro/index.html: https://store-images.s-microsoft.com/image/apps.48224.14093099495542792.09445a70-e9c2-4d21-ba3e-16466524684d.c104d267-7a5f-4dec-973f-efc29d93c5e2
- apps/otp-password-manager-pro/index.html: https://store-images.s-microsoft.com/image/apps.47969.14093099495542792.09445a70-e9c2-4d21-ba3e-16466524684d.1d775013-8e4b-4235-8cbb-b3e16564d883
- categories/security/index.html: https://store-images.s-microsoft.com/image/apps.48224.14093099495542792.09445a70-e9c2-4d21-ba3e-16466524684d.c104d267-7a5f-4dec-973f-efc29d93c5e2

The external image dimensions were not invented. A direct fetch attempt from the local Node runtime failed for Microsoft Store image CDN URLs, so those dimensions remain documented rather than guessed.

## Expected performance impact

- Local image dimensions reduce potential layout shift.
- Lazy loading remains enabled for below-the-fold screenshots and cards.
- Hero/main screenshot images stay eager where they are likely above the fold.
- No additional image library, CDN, backend, or paid service was added.
