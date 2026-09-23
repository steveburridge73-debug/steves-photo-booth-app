export const STRICT_IDENTITY =
  "Preserve the original subject, identity, facial features, expression, proportions, clothing, objects, composition, perspective, lighting, colours, textures and important details unless I explicitly request a change.";

export const CREATIVE_IDENTITY =
  "Keep the original person or subject recognisable. Preserve facial identity, age range and key features unless the requested transformation specifically changes them. Do not invent a different person. Do not change clothing, objects or setting except where the requested edit needs it.";

export const RESTORATION_SAFETY =
  "Restore the photograph faithfully. Do not invent a new photograph. Preserve identity, age and expression. Preserve original clothing and composition. Do not invent facial features or reshape faces. Do not beautify, modernise historical scenes unless explicitly requested, or produce plastic-looking skin. Avoid excessive sharpening and artificial colours. Do not change people into different people. The result should look like a restored photograph, not a newly generated one.";

export const PORTRAIT_IDENTITY =
  "Use the uploaded photograph as the only identity reference. Preserve the person’s recognisable identity, facial features, natural skin tone, hairstyle, expression and proportions unless a deliberate creative transformation is requested. Do not reshape, beautify or redesign the face. Do not invent facial features. Do not interpret flattering light or retouching as permission to change the face. Keep realistic skin texture. Photorealistic, not a different person.";

export const AUTOFIX_SAFETY =
  "This is an automatic photograph improvement, not a redesign. Preserve the original composition and important subjects. Do not invent important scenery or celestial detail that is not reasonably supported by the original image. Do not remove people, vehicles or objects unless the user selected that removal. Do not make colours overly saturated or artificial. The result should look like a well-made version of the same photograph.";

export const RESCUE_SAFETY =
  "This is a rescue of a difficult photograph, not a new picture. Recover only detail that is reasonably supported by the original. Do not invent facial features, people, objects, text or scenery. Do not beautify or modernise unless explicitly requested. The original must remain unchanged as a separate file.";

export const CLOTHING_SAFETY =
  "Change only clothing, costume or named accessories. Preserve the person’s face, identity, facial features, expression, hairstyle, body proportions, pose, skin tone and the background. Do not alter other people. Make fabric follow the body, pose, lighting, shadows and perspective. The original photograph stays unchanged as a separate file.";

export const TOOLKIT_SAFETY =
  "Make only the requested local edit. Match perspective, lighting, shadows, texture, colour, scale and image quality. Do not change identity, clothing, pose or anything that was not asked for.";

export const FACE_SAFETY =
  "Preserve identity, facial structure, eyes, nose, mouth, skin tone, hairstyle, expression and age appearance. Do not beautify, reshape, reconstruct or invent facial features. Keep realistic skin texture.";

export const NO_UNREQUESTED =
  "Make only the change this tool is for. Do not silently remove objects, add people, change backgrounds, alter colours, change clothing, modify text or alter scenery unless the user requested it or ticked that option.";

export const NO_INVENTED =
  "Do not invent facial features, text, numbers, dates, names, historical details, objects or architectural details that cannot reasonably be recovered from the original. If the requested edit cannot be done reliably, keep the original look rather than guessing.";

export const ORIGINAL_PROTECTED =
  "The original photograph must remain unchanged as a separate file. This result is a new version.";

export const QUALITY_RULE =
  "Preserve the highest practical photographic quality and resolution. Avoid plastic skin, crushed detail and heavy compression artefacts.";

export const DEFAULT_OUTPUT =
  "Return a single high-quality photograph that fills the frame. Do not add borders, watermarks, captions, logos or collage frames unless I explicitly ask for them.";

