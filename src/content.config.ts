import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { localContentLoader } from './content-model/loader';

const taxonomyFields = {
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
};

const publicationFields = {
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
};

const mediaFields = <T extends z.ZodType>(image: () => T) => ({
	cover: z.union([image(), z.string()]).optional(),
});

const posts = defineCollection({
  // Independent posts + folder-owned chapters share the existing query interface.
  loader: localContentLoader('posts'),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        // description 允许缺省，但**不允许显式为空串**：
        // 缺省时由 utils/content.ts 的 resolvePostDescription() 从正文抽取摘要，
        // 显式写空串则视为错误（那说明作者本来想写却没写）。
        // 历史上 121/124 篇完全没有 description，导致 RSS 输出空条目、卡片无摘要。
        description: z.string().min(1, 'description 不能为空串：请填写，或直接省略由正文自动生成').optional(),
        author: z.string().default(""),
        layout: z.string().optional(),
        columnId: z.string().optional(), // Loader-derived; never authored in frontmatter.
        // 专栏章节的阅读顺序（从 1 开始）。仅对属于专栏的文章有意义。
        // 必须显式声明而不能只靠日期：实测 stm32-8 的日期早于 stm32-5，
        // 且 dsa-2/3、dsa-4/5 共享同一时间戳，纯按 pubDate 排序会打乱章节顺序。
        order: z.number().int().positive().optional(),
        mathjax: z.boolean().default(false),
        topic: z.string().optional(),
        // 日期：Hexo 遗留的 `date` 与 Astro 惯用的 `pubDate` 均接受，
        // 但统一在 transform 里归一化到 pubDate（实测当前 124 篇全用 date）。
        pubDate: z.coerce.date().optional(),
        date: z.coerce.date().optional(),
        updated: z.coerce.date().optional(), // Hexo alias for updatedDate
        ...taxonomyFields,
        ...publicationFields,
        ...mediaFields(image),
      })
      .refine(
        (data) => data.pubDate !== undefined || data.date !== undefined,
        { message: '文章必须存在 pubDate 或 date 字段（避免悄悄回退到 1970 年）' },
      )
      .transform((data) => ({
        ...data,
        pubDate: data.pubDate ?? data.date ?? new Date(0),
        updatedDate: data.updatedDate ?? data.updated,
      })),
});

const columns = defineCollection({
  loader: localContentLoader('columns'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().default(""),
      pubDate: z.coerce.date().optional(),
      columnId: z.string().optional(), // Loader-derived; never authored in frontmatter.
      order: z.number().int().default(0),
      icon: z.string().optional(),
      accent: z.string().optional(),
      layout: z.string().default("column"),
      ...taxonomyFields,
      ...publicationFields,
      ...mediaFields(image),
    }),
});

const goods = defineCollection({
  loader: glob({ base: "./src/content/goods", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(["电子产品", "生活用品", "数码配件"]),
    price: z.number(),
    rating: z.number(),
    reviewCount: z.number().int(),
    purchaseDate: z.coerce.date(),
    status: z.enum(["仍在使用", "已废置", "偶尔使用"]),
    image: z.string().optional(),
  }),
});

const phones = defineCollection({
  loader: glob({ base: "./src/content/phones", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    name: z.string(),
    alias: z.string(),
    brand: z.string(),
    brandAlias: z.string(),
    releaseYear: z.number().int(),
    yearFrom: z.number().int(),
    yearTo: z.number().int().nullable().default(null),
    stillOwn: z.boolean().default(false),
    isPrimary: z.boolean().default(false),
    color: z.string(),
    colorName: z.string().optional(),
    like: z.enum(["y", "n", ""]).default(""),
    comment: z.string().optional(),
    imagePath: z.string(),
    addedAt: z.coerce.date().optional(),
    order: z.number().int().default(0),
  }),
});

const loveTimeline = defineCollection({
  loader: file("./src/content/love/timeline.yaml"),
  schema: z.object({
    badge: z.string(),
    date: z.string(),
    title: z.string(),
    description: z.string(),
  }),
});

const lovePhotos = defineCollection({
  loader: file("./src/content/love/photos.yaml"),
  schema: z.object({
    date: z.string(),
    title: z.string(),
    caption: z.string(),
    image: z.string(),
  }),
});

const loveFirsts = defineCollection({
  loader: file("./src/content/love/firsts.yaml"),
  schema: z.object({
    icon: z.string(),
    title: z.string(),
    date: z.string(),
    description: z.string(),
  }),
});

const loveStats = defineCollection({
  loader: file("./src/content/love/stats.yaml"),
  schema: z.object({
    icon: z.string(),
    target: z.number(),
    suffix: z.string().default(""),
    label: z.string(),
  }),
});

const loveTraits = defineCollection({
  loader: file("./src/content/love/traits.yaml"),
  schema: z.object({
    icon: z.string(),
    label: z.string(),
    size: z.enum(["sm", "md", "lg"]).default("md"),
  }),
});

const loveDestinations = defineCollection({
  loader: file("./src/content/love/destinations.yaml"),
  schema: z.object({
    number: z.string(),
    city: z.string(),
    description: z.string(),
    tag: z.string(),
    visited: z.boolean().default(false),
  }),
});

const loveWishes = defineCollection({
  loader: file("./src/content/love/wishes.yaml"),
  schema: z.object({
    text: z.string(),
    category: z.string(),
    done: z.boolean().default(false),
  }),
});

const lovePromises = defineCollection({
  loader: file("./src/content/love/promises.yaml"),
  schema: z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
    tag: z.string(),
  }),
});

const loveCalendar = defineCollection({
  loader: file("./src/content/love/calendar.yaml"),
  schema: z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    weatherIcon: z.string(),
    weather: z.string(),
    moodIcon: z.string(),
    mood: z.string(),
    icon: z.string(),
    category: z.string(),
  }),
});

const loveNotes = defineCollection({
  loader: file("./src/content/love/notes.yaml"),
  schema: z.object({
    text: z.string(),
  }),
});


const cities = defineCollection({
  loader: glob({ base: "./src/content/cities", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    country: z.string().default("中国"),
    countryCode: z.string().optional(),
    region: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    visitedAt: z.coerce.date(),
    revisits: z.array(z.coerce.date()).default([]),
    note: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const residences = defineCollection({
  loader: glob({
    base: "./src/content/residences",
    pattern: "**/*.{yaml,yml}",
  }),
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    country: z.string().default("中国"),
    province: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    since: z.coerce.date(),
    until: z.coerce.date().optional(),
    kind: z.enum(["birth", "school", "university", "work", "home"]),
    order: z.number().int().default(0),
    note: z.string().optional(),
  }),
});

// 学苑课时（/learn）：独立平铺文档，不需要 posts 的章节机制，用 glob loader。
const lessons = defineCollection({
  loader: glob({ base: "./src/content/lessons", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().min(1, 'description 不能为空串'),
      /** 领域分组：'系统' | '语言' | '网络' …，索引页按此分组 */
      domain: z.string(),
      level: z.enum(['入门', '进阶', '深潜']).default('入门'),
      /** 阅读时长提示，如 '约 25 分钟' */
      duration: z.string().optional(),
      tags: z.array(z.string()).default([]),
      order: z.number().int().default(0),
      pubDate: z.coerce.date().optional(),
      // 课程 hero（LessonLayout lead 槽）扩展字段，全部可选
      hero: z
        .object({
          eyebrow: z.string().optional(),
          lead: z.string().optional(),
          /** 标题里要高亮（包 <em>）的词 */
          titleHighlight: z.string().optional(),
          terminal: z
            .object({
              prompt: z.string(),
              output: z.string(),
              note: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      // 行内术语自动注解字典：kl-term-annotate 会在正文里把匹配词包成 kl-term 弹层
      terms: z.record(z.string(), z.string()).optional(),
      ...publicationFields,
      ...mediaFields(image),
    }),
});

// 只声明 src/content/ 下真实存在数据的 collection：
// 此前 19 个声明里有 2 个（wiki / notes）没有对应目录，属于失效配置，已删除。
export const collections = {
  posts,
  columns,
  lessons,
  goods,
  phones,
	cities,
	residences,
  loveTimeline,
  lovePhotos,
  loveFirsts,
  loveStats,
  loveTraits,
  loveDestinations,
  loveWishes,
  lovePromises,
  loveCalendar,
  loveNotes,
};