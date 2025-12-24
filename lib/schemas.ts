// import * as z from "zod"
// const validateLanguage = (text: string, lang: 'ar' | 'en') => {
//   const arabicRegex = /^[\u0600-\u06FF\s]+$/
//   const englishRegex = /^[A-Za-z\s]+$/
//   return lang === 'ar' ? arabicRegex.test(text) : englishRegex.test(text)
// }

// export const blogPostSchema = z.discriminatedUnion('lang', [
//   z.object({
//     lang: z.literal('ar'),
//     title: z.string()
//       .min(1, "العنوان مطلوب")
//       .refine(text => validateLanguage(text, 'ar'), {
//         message: "يجب أن يحتوي النص على حروف عربية فقط"
//       }),
//     description: z.string()
//       .min(1, "المحتوى مطلوب")
//       .refine(text => validateLanguage(text, 'ar'), {
//         message: "يجب أن يحتوي النص على حروف عربية فقط"
//       }),
//     Keywords: z.array(z.string()).optional(),
//     image: z.union([z.string().url(), z.instanceof(File)]).optional(),
//   }),
//   z.object({
//     lang: z.literal('en'),
//     title: z.string()
//       .min(1, "Title is required")
//       .refine(text => validateLanguage(text, 'en'), {
//         message: "Text must contain only English characters"
//       }),
//     description: z.string()
//       .min(1, "Content is required")
//       .refine(text => validateLanguage(text, 'en'), {
//         message: "Text must contain only English characters"
//       }),
//     Keywords: z.array(z.string()).optional(),
//     image: z.union([z.string().url(), z.instanceof(File)]).optional(),
//   })
// ]);


// export const faqSchema = z.object({
//   question: z.string()
//     .min(1, "السؤال مطلوب")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن يحتوي السؤال على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Question must contain Arabic text only" }
//     ),
//   answer: z.string()
//     .min(1, "الإجابة مطلوبة")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن تحتوي الإجابة على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Answer must contain Arabic text only" }
//     ),
//   keywords: z.array(z.string()),
//   lang: z.string().min(1),
// });

// export const reviewSchema = z.object({
//   name: z.string()
//     .min(1, "الاسم مطلوب")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن يحتوي الاسم على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Name must contain Arabic text only" }
//     ),
//   comment: z.string()
//     .min(1, "التعليق مطلوب")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن يحتوي التعليق على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Comment must contain Arabic text only" }
//     ),
//   rating: z.number().min(1).max(5),
//   image: z.any().optional(),
//   lang: z.string().min(1),
// });

// export const propertySchema = z.object({
//   title: z.string()
//     .min(1, "العنوان مطلوب")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن يحتوي العنوان على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Title must contain Arabic text only" }
//     ),
//   description: z.string()
//     .min(1, "الوصف مطلوب")
//     .refine(
//       (text) => validateLanguage(text, 'ar'),
//       { message: "يجب أن يحتوي الوصف على حروف عربية فقط" }
//     )
//     .refine(
//       (text) => !validateLanguage(text, 'en'),
//       { message: "Description must contain Arabic text only" }
//     ),
//   price: z.number().min(0, "السعر يجب أن يكون أكبر من صفر"),
//   location: z.string().min(1, "الموقع مطلوب"),
//   type: z.string().min(1, "نوع العقار مطلوب"),
//   images: z.array(z.any()),
//   keywords: z.array(z.string()),
//   lang: z.string().min(1),
// });










import * as z from "zod"

const validateLanguage = (text: string, lang: 'ar' | 'en') => {
  const arabicRegex = /^[\u0600-\u06FF\s0-9.,!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`؟،؛\d\u0660-\u0669]+$/u;
  const englishRegex = /^[A-Za-z\s0-9.,!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
  
  // نتجاهل التحقق إذا كان النص يحتوي على HTML أو روابط
  if (text.includes('<') || text.includes('http') || text.includes('www.')) {
    return true;
  }
  
  return lang === 'ar' ? arabicRegex.test(text) : englishRegex.test(text);

 
}
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, ''); // إزالة جميع علامات HTML
};
// أولاً نعدل دالة التحقق من اللغة لتكون أكثر مرونة


export const blogPostSchema = z.discriminatedUnion('lang', [
  z.object({
    lang: z.literal('ar'),
    title: z.string().optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    Keywords: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.union([
      z.string().url(),
      z.instanceof(File),
      z.null()
    ]).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
    author: z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().url().optional()
    }).optional(),
    meta: z.object({
      views: z.number().default(0),
      likes: z.number().default(0),
      readTime: z.number().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional()
    }).optional(),
    publishedAt: z.date().optional(),
    updatedAt: z.date().optional(),
    allowComments: z.boolean().default(true),
    featured: z.boolean().default(false)
  }),
  
  // نفس المخطط للغة الإنجليزية
  z.object({
    lang: z.literal('en'),
    title: z.string().optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    Keywords: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.union([
      z.string().url(),
      z.instanceof(File),
      z.null()
    ]).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
    author: z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().url().optional()
    }).optional(),
    meta: z.object({
      views: z.number().default(0),
      likes: z.number().default(0),
      readTime: z.number().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional()
    }).optional(),
    publishedAt: z.date().optional(),
    updatedAt: z.date().optional(),
    allowComments: z.boolean().default(true),
    featured: z.boolean().default(false)
  })
]);

export const faqSchema = z.discriminatedUnion('lang', [
  z.object({
    lang: z.literal('ar'),
    question: z.string().optional(),
    answer: z.string().optional(),
  }),
  z.object({
    lang: z.literal('en'),
    question: z.string().optional(),
    answer: z.string().optional(),
  })
]);


export const reviewSchema = z.discriminatedUnion('lang', [
  z.object({
    lang: z.literal('ar'),
    name: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
    rate: z.number().optional(),
    image: z.union([z.string().url(), z.instanceof(File)]).optional(),
  }),
  z.object({
    lang: z.literal('en'),
    name: z.string().optional(),
    country: z.string().optional(),
    description: z.string().optional(),
    rate: z.number().optional(),
    image: z.union([z.string().url(), z.instanceof(File)]).optional(),
  })
]);
export const propertySchema = z.discriminatedUnion('lang', [
  z.object({
    lang: z.literal('ar'),
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    location: z.string().optional(),
    type: z.string().optional(),
    images: z.array(z.any()).optional(),
    keywords: z.array(z.string()).optional(),
  }),
  z.object({
    lang: z.literal('en'),
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    location: z.string().optional(),
    type: z.string().optional(),
    images: z.array(z.any()).optional(),
    keywords: z.array(z.string()).optional(),
  })
]);


export const categorySchema = z.discriminatedUnion('lang', [
  z.object({
    lang: z.literal('ar'),
    title: z.string().optional(),
    area: z.number().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.union([
      z.instanceof(File)
        .refine(file => file.size > 0, { message: "حجم الصورة غير صالح" })
        .refine(file => file.type.startsWith('image/'), {
          message: "يجب أن يكون الملف صورة"
        }),
      z.undefined()
    ]).optional(),
    existingImages: z.array(
      z.object({
        url: z.string(),
        public_id: z.string()
      })
    ).optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }),
  z.object({
    lang: z.literal('en'),
    title: z.string().optional(),
    area: z.number().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    image: z.union([
      z.instanceof(File)
        .refine(file => file.size > 0, { message: "Invalid image size" })
        .refine(file => file.type.startsWith('image/'), {
          message: "File must be an image"
        }),
      z.undefined()
    ]).optional(),
    existingImages: z.array(
      z.object({
        url: z.string(),
        public_id: z.string()
      })
    ).optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  })
]);
