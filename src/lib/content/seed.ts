import type { SiteData, Project } from "./types";

const img = (p: string) => `/images/${p}`;

const gallery = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => img(`projects/${slug}-${i}.jpg`));

// Scope as the portfolio states it for each project (Portfolio R4).
const pm = { en: "Project management", ar: "إدارة المشاريع" };
const execution = { en: "Execution", ar: "التنفيذ" };
const supervision = { en: "Site supervision", ar: "إدارة ومتابعة الموقع" };
const interiorDesign = { en: "Interior design", ar: "التصميم الداخلي" };
const renovation = { en: "Renovation", ar: "التجديد والتطوير" };

const restaurantLounge = { en: "Restaurant & Lounge", ar: "مطعم وصالة" };
const jeddah = { en: "Jeddah", ar: "جدة" };

const projects: Project[] = [
  {
    id: "p-kabana",
    slug: "kabana",
    name: "Kabana",
    nameAr: "كابانا",
    type: restaurantLounge,
    sector: "hospitality",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "A layered lounge under a domed ceiling: brass-framed columns, deep velvet seating and warm table lamps, with a terrace that opens the room to the city.",
      ar: "صالة متعددة الطبقات تحت سقف مقبّب؛ أعمدة بإطارات نحاسية، ومقاعد مخملية عميقة، وإضاءة طاولات دافئة، مع تراس يفتح المكان على المدينة.",
    },
    cover: img("projects/kabana-0.jpg"),
    gallery: gallery("kabana", 4),
    featured: true,
    inBook: true,
    published: true,
    order: 1,
  },
  {
    id: "p-bread-ahead",
    slug: "bread-ahead",
    name: "Bread Ahead",
    nameAr: "بريد أهيد",
    type: restaurantLounge,
    sector: "hospitality",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "Cast-iron arches, exposed brick and a marble counter built for bread. A bakery and teaching kitchen with the warmth of a London market hall.",
      ar: "أقواس من الحديد المشغول وطوب ظاهر وكاونتر رخامي صُمم للخبز؛ مخبز ومطبخ تعليمي بدفء أسواق لندن القديمة.",
    },
    cover: img("projects/bread-ahead-0.jpg"),
    gallery: gallery("bread-ahead", 4),
    featured: true,
    inBook: true,
    published: true,
    order: 2,
  },
  {
    id: "p-nemah",
    slug: "nemah-bakery",
    name: "Nemah Bakery",
    nameAr: "مخبز نعمة",
    type: { en: "Retail", ar: "متجر تجزئة" },
    sector: "commercial",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "Long marble-clad display counters under a timber-edged ceiling, planned so the product leads and customers move freely.",
      ar: "كاونترات عرض طويلة مكسوّة بالرخام تحت سقف بحواف خشبية، مخطط ليتصدّر المنتج المشهد ويتحرك الزبائن بسهولة.",
    },
    cover: img("projects/nemah-0.jpg"),
    gallery: gallery("nemah", 3),
    featured: false,
    inBook: true,
    published: true,
    order: 3,
  },
  {
    id: "p-kiaora",
    slug: "kiaora",
    name: "Kiaora Coffee",
    nameAr: "كيا أورا كوفي",
    type: restaurantLounge,
    sector: "hospitality",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "An industrial café of raw plaster, black steel and suspended timber baffles, lit by strings of bare bulbs.",
      ar: "مقهى بطابع صناعي من الجص الخام والحديد الأسود وألواح خشبية معلّقة، تضيئه سلاسل من المصابيح المكشوفة.",
    },
    cover: img("projects/kiaora-0.jpg"),
    gallery: gallery("kiaora", 4),
    featured: false,
    inBook: true,
    published: true,
    order: 4,
  },
  {
    id: "p-dumdum",
    slug: "dumdum-donuts",
    name: "DumDum Donuts",
    nameAr: "دم دم دونتس",
    type: restaurantLounge,
    sector: "hospitality",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "Patterned cement tiles, bold brand graphics and warm oak seating: a playful counter-service space that stays easy to run.",
      ar: "بلاط إسمنتي منقوش، وهوية بصرية جريئة، ومقاعد من خشب البلوط الدافئ؛ مساحة خدمة مرحة وسهلة التشغيل.",
    },
    cover: img("projects/dumdum-0.jpg"),
    gallery: gallery("dumdum", 4),
    featured: false,
    inBook: true,
    published: true,
    order: 5,
  },
  {
    id: "p-abdullah",
    slug: "abdullah-apartment",
    name: "Abdullah's Apartment",
    nameAr: "شقة عبدالله",
    type: { en: "Apartment", ar: "شقة سكنية" },
    sector: "residential",
    city: jeddah,
    year: "",
    area: "",
    scope: [interiorDesign, execution, supervision],
    summary: {
      en: "A city apartment in soft textures: curved cream and sage seating, a dark stone dining table, backlit display shelving, and the laundry hidden behind sage-green doors.",
      ar: "شقة في المدينة بخامات ناعمة؛ مقاعد منحنية بدرجات الكريمي والأخضر الهادئ، وطاولة طعام من الحجر الداكن، ورفوف عرض بإضاءة خلفية، وغرفة غسيل مخفية خلف أبواب خضراء.",
    },
    cover: img("projects/abdullah-0.jpg"),
    gallery: gallery("abdullah", 4),
    featured: false,
    inBook: true,
    published: true,
    order: 6,
  },
  {
    id: "p-north-coffee",
    slug: "north-coffee",
    name: "North Coffee",
    nameAr: "نورث كوفي",
    type: restaurantLounge,
    sector: "hospitality",
    city: jeddah,
    year: "",
    area: "",
    scope: [pm, execution],
    summary: {
      en: "A standalone café pavilion in sand-toned render, with hand-carved relief walls and a sun motif that follows guests inside.",
      ar: "جناح مقهى مستقل بلياسة بلون الرمل، وجدران بنقوش بارزة منحوتة يدويًا، وشمس ترافق الزوّار إلى الداخل.",
    },
    cover: img("projects/north-coffee-0.jpg"),
    gallery: gallery("north-coffee", 4),
    featured: true,
    inBook: true,
    published: true,
    order: 7,
  },
  {
    id: "p-aref",
    slug: "aref-house",
    name: "Aref's House",
    nameAr: "منزل عارف",
    type: { en: "House", ar: "منزل" },
    sector: "residential",
    city: jeddah,
    year: "",
    area: "",
    scope: [renovation, execution, supervision],
    summary: {
      en: "A family house renovated around its courtyard pool: textured stone walls, wide glazing onto the water, herringbone-tiled bathrooms, and a timber mezzanine with a black steel stair.",
      ar: "منزل عائلي جُدِّد حول مسبح الفناء؛ جدران حجرية بملمس بارز، وواجهات زجاجية واسعة تطل على الماء، وحمّامات ببلاط بنقشة عظم السمكة، وميزانين خشبي بدرج من الحديد الأسود.",
    },
    cover: img("projects/aref-0.jpg"),
    gallery: gallery("aref", 4),
    featured: true,
    inBook: true,
    published: true,
    order: 8,
  },
  {
    id: "p-saleh",
    slug: "saleh-house",
    name: "Saleh's House",
    nameAr: "منزل صالح",
    type: { en: "House", ar: "منزل" },
    sector: "residential",
    city: jeddah,
    year: "",
    area: "",
    scope: [renovation, execution, supervision],
    summary: {
      en: "Glossy bronze ceilings over cream seating, a round arched niche and warm stone: a house renovated for long evenings with family and guests.",
      ar: "أسقف برونزية لامعة فوق مقاعد كريمية، وكوّة دائرية مقوّسة، وحجر دافئ؛ منزل جُدِّد لأمسيات طويلة مع العائلة والضيوف.",
    },
    cover: img("projects/saleh-0.jpg"),
    gallery: gallery("saleh", 4),
    featured: false,
    inBook: true,
    published: true,
    order: 9,
  },
];

export const seed: SiteData = {
  content: {
    hero: {
      title: {
        en: "Design.\nBuild.\n*Deliver.*",
        ar: "تصميم.\nتنفيذ.\n*تسليم.*",
      },
      sub: {
        en: "Archi Builder plans, builds and finishes residential and commercial spaces across Saudi Arabia. One process, one direction, one accountable team.",
        ar: "المعماري للبناء تخطط وتنفّذ وتشطّب المساحات السكنية والتجارية في المملكة. منهجية واحدة، اتجاه واحد، وفريق واحد مسؤول.",
      },
      cta: { en: "Start a project", ar: "ابدأ مشروعك" },
      image: img("site/villa-dusk.jpg"),
    },
    about: {
      title: {
        en: "We build the idea, *and manage every detail until it becomes real.*",
        ar: "نبني الفكرة… *وندير تفاصيلها حتى تصبح واقعًا.*",
      },
      body: [
        {
          en: "Archi Builder delivers and develops residential and commercial projects. We started with one aim: give clients a more integrated, clearer experience through the whole journey of a project.",
          ar: "المعماري للبناء شركة متخصصة في تنفيذ وتطوير المشاريع السكنية والتجارية، انطلقت برؤية تهدف إلى تقديم تجربة أكثر تكاملًا ووضوحًا للعميل خلال رحلة المشروع.",
        },
        {
          en: "We manage projects from the first sketches, through planning and coordination between disciplines, execution and finishing, to quality control and final handover.",
          ar: "نعمل على إدارة المشروع منذ المراحل الأولية، مرورًا بالتخطيط والتنسيق بين التخصصات، وإدارة أعمال التنفيذ والتشطيبات، وصولًا إلى مراقبة الجودة والتسليم النهائي.",
        },
        {
          en: "Our work is led by an engineering team that treats every project as one system: build quality, clear details, cost control and engineering coordination.",
          ar: "يقود أعمالنا فريق هندسي يتعامل مع كل مشروع باعتباره منظومة متكاملة تجمع بين جودة التنفيذ، ووضوح التفاصيل، وإدارة التكلفة، والتنسيق الهندسي.",
        },
      ],
      image: img("site/living-hall.jpg"),
    },
    vision: {
      title: {
        en: "Considered projects, *built as they were planned.*",
        ar: "مشاريع مدروسة، *تُنفَّذ كما خُطِّط لها.*",
      },
      body: {
        en: "To build a trusted Saudi name in construction: one integrated experience that connects the idea, the plan and the build, with a focus on quality, detail and the long-term value of every project.",
        ar: "نسعى لبناء علامة سعودية موثوقة في قطاع البناء والتنفيذ، تقدّم تجربة متكاملة تربط بين الفكرة والتخطيط والتنفيذ، مع التركيز على الجودة والتفاصيل والقيمة طويلة المدى للمشروع.",
      },
      image: img("site/vision-dining.jpg"),
    },
    mission: {
      title: {
        en: "Not just spaces we build, *but journeys that last.*",
        ar: "ليست مجرد مساحات نبنيها، *إنما رحلة نخلّدها.*",
      },
      body: {
        en: [
          "Our mission is to deliver integrated solutions for executing and managing projects, grounded in engineering knowledge, clear planning and effective coordination between disciplines, so a client's requirements and the design vision become a project that can be built efficiently and well.",
          "We manage a project's details from the earliest stages: studying the requirements, reviewing the drawings and defining the scope of works, through coordination between disciplines, suppliers and site teams, to quality follow-up, closing out snags and final handover.",
          "We believe a project's success depends not only on the quality of the build, but on the quality of the decisions that come before it. So we focus on planning ahead, clear responsibilities, and resolving details and clashes before they reach the site.",
          "Our aim is to make the build a clearer journey for the client, and to turn the idea into a reality that stays as true as possible to the project's original vision and its technical and functional requirements.",
        ].join("\n\n"),
        ar: [
          "تتمثل رسالتنا في تقديم حلول متكاملة لتنفيذ وإدارة المشاريع، ترتكز على المعرفة الهندسية، التخطيط الواضح والتنسيق الفعّال بين مختلف التخصصات، بما يضمن تحويل متطلبات العميل والرؤية التصميمية إلى مشروع قابل للتنفيذ بكفاءة وجودة.",
          "نعمل على إدارة تفاصيل المشروع منذ المراحل الأولى، من دراسة المتطلبات ومراجعة المخططات وتحديد نطاق الأعمال، مرورًا بالتنسيق بين التخصصات والموردين وفرق التنفيذ، وحتى متابعة الجودة وإغلاق الملاحظات والتسليم النهائي.",
          "نؤمن بأن نجاح المشروع لا يعتمد فقط على جودة التنفيذ، بل على جودة القرارات التي تسبقه. لذلك نركز على التخطيط المسبق، وضوح المسؤوليات، ومعالجة التفاصيل والتعارضات قبل وصولها إلى الموقع.",
          "هدفنا أن تكون رحلة التنفيذ أكثر وضوحًا للعميل، وأن تتحول الفكرة إلى واقع يحافظ قدر الإمكان على الرؤية الأصلية للمشروع ومتطلباته الفنية والوظيفية.",
        ].join("\n\n"),
      },
      image: img("site/mission.jpg"),
    },
    values: [
      {
        key: "quality",
        title: { en: "Quality", ar: "الجودة" },
        body: {
          en: "Quality isn't a final stage. It's a standard that starts with choosing materials and runs into the smallest detail of the build.",
          ar: "الجودة ليست مرحلة نهائية، بل معيار يبدأ من اختيار المواد ويمتد إلى أدق تفاصيل التنفيذ.",
        },
      },
      {
        key: "transparency",
        title: { en: "Transparency", ar: "الشفافية" },
        body: {
          en: "Scope, costs, changes and project status, kept clear with the client at every point.",
          ar: "وضوح النطاق والتكاليف والتغييرات وحالة المشروع مع العميل.",
        },
      },
      {
        key: "detail",
        title: { en: "Detail", ar: "الاهتمام بالتفاصيل" },
        body: {
          en: "The small details are what separate a good project from a finished one.",
          ar: "الاهتمام بالتفاصيل الصغيرة هو ما يصنع الفرق في جودة المشروع النهائي.",
        },
      },
      {
        key: "commitment",
        title: { en: "Commitment", ar: "الالتزام" },
        body: {
          en: "Design and site work managed to a clear scope and schedule, followed through every stage.",
          ar: "إدارة الأعمال التصميمية والتنفيذية وفق نطاق وجدول واضحين ومتابعة مستمرة لجميع المراحل.",
        },
      },
      {
        key: "integration",
        title: { en: "Integration", ar: "التكامل" },
        body: {
          en: "Architecture, structure, MEP and execution coordinated as a single system.",
          ar: "تنسيق أعمال التصميم المعمارية والمراحل الإنشائية والكهروميكانيكية والتنفيذية كمنظومة واحدة.",
        },
      },
    ],
    services: [
      {
        key: "construction",
        title: { en: "Construction", ar: "التنفيذ والبناء" },
        body: {
          en: "Residential and commercial projects built from structural works through finishing and handover.",
          ar: "تنفيذ المشاريع السكنية والتجارية ابتداءً من الأعمال الإنشائية وحتى مراحل التشطيب والتسليم.",
        },
        image: img("site/execution.jpg"),
      },
      {
        key: "fit-out",
        title: { en: "Fit-out", ar: "التشطيبات الداخلية" },
        body: {
          en: "Interior works managed and delivered: floors, ceilings, paint, joinery, and the electrical and mechanical works that come with them.",
          ar: "إدارة وتنفيذ أعمال التشطيبات الداخلية بما يشمل الأرضيات والأسقف والدهانات والنجارة والأعمال الكهربائية والميكانيكية المرتبطة بالمشروع.",
        },
        image: img("site/sector-interior.jpg"),
      },
      {
        key: "project-management",
        title: { en: "Project management", ar: "إدارة المشاريع" },
        body: {
          en: "Planning, follow-up and coordination between suppliers, contractors and disciplines, with progress tracked on site.",
          ar: "التخطيط والمتابعة والتنسيق بين الموردين والمقاولين والتخصصات المختلفة ومراقبة تقدم الأعمال.",
        },
        image: img("site/methodology.jpg"),
      },
      {
        key: "site-supervision",
        title: { en: "Site supervision", ar: "إدارة ومتابعة الموقع" },
        body: {
          en: "Works and quality followed on site, checked against the approved drawings and specifications.",
          ar: "متابعة الأعمال التنفيذية والجودة والتأكد من توافق الأعمال مع المخططات والمواصفات المعتمدة.",
        },
        image: img("site/site-review.jpg"),
      },
      {
        key: "renovation",
        title: { en: "Renovation", ar: "التجديد والتطوير" },
        body: {
          en: "Existing homes and commercial spaces rehabilitated, working better and looking better.",
          ar: "إعادة تأهيل وتطوير المساحات السكنية والتجارية القائمة ورفع كفاءتها الوظيفية والبصرية.",
        },
        image: img("site/vision-dining.jpg"),
      },
      {
        key: "design-coordination",
        title: { en: "Design coordination", ar: "التنسيق التصميمي" },
        body: {
          en: "Design requirements coordinated with authorities and engineering offices, and tied to what the build actually needs.",
          ar: "إدارة وتنسيق متطلبات التصميم مع الجهات والمكاتب الهندسية المختصة وربط المخرجات التصميمية بمتطلبات التنفيذ.",
        },
        image: img("site/drawings.jpg"),
      },
    ],
    sectorsIntro: {
      title: { en: "Where vision meets *every space.*", ar: "حيث تلتقي الرؤية *بكل مساحة.*" },
      body: {
        en: "Good design doesn't stop at a sector line. In homes, we build around the people who live there. In commercial spaces, around the work they hold, from shops and offices to cafés where light, spirit and layout make an experience people remember. In fit-out, finishes turn a space into a place.",
        ar: "لا يعرف التصميم المتميز حدودًا بين القطاعات، بل يدرك الفرصة الكامنة في كل مساحة. في القطاع السكني نؤمن بأن المنزل انعكاس لهوية من يسكنه، وفي القطاع التجاري نصمم بيئات تخدم العمل الذي تحتضنه، من المحلات والمكاتب إلى الكافيهات والمطاعم حيث تتكامل الإضاءة والروح والتوزيع المكاني لخلق تجارب لا تُنسى. وفي التشطيبات الداخلية ترسم التفاصيل لوحة تمنح المساحة حياتها الحقيقية.",
      },
    },
    sectors: [
      {
        key: "residential",
        title: { en: "Residential", ar: "السكني" },
        items: [
          { en: "Villas", ar: "الفلل" },
          { en: "Apartments", ar: "الشقق" },
          { en: "Private residences", ar: "المساكن الخاصة" },
        ],
        image: img("site/sector-residential.jpg"),
      },
      {
        key: "commercial",
        title: { en: "Commercial", ar: "التجاري" },
        items: [
          { en: "Retail", ar: "المحلات" },
          { en: "Offices", ar: "المكاتب" },
          { en: "Cafés", ar: "الكافيهات" },
          { en: "Restaurants", ar: "المطاعم" },
        ],
        image: img("site/sector-commercial.jpg"),
      },
      {
        key: "hospitality",
        title: { en: "Interior & fit-out", ar: "التشطيبات الداخلية" },
        items: [
          { en: "Residential", ar: "السكنية" },
          { en: "Hospitality", ar: "الفندقية" },
          { en: "Commercial spaces", ar: "المساحات التجارية" },
        ],
        image: img("site/sector-interior.jpg"),
      },
    ],
    process: [
      {
        title: { en: "Understand", ar: "الفهم" },
        body: {
          en: "The project, the client's requirements, the budget and the scope.",
          ar: "فهم المشروع ومتطلبات العميل والميزانية والنطاق.",
        },
      },
      {
        title: { en: "Plan", ar: "التخطيط" },
        body: {
          en: "Scope of works, execution plan, requirements and an initial schedule.",
          ar: "تحديد نطاق الأعمال، خطة التنفيذ، الاحتياجات والجدول المبدئي.",
        },
      },
      {
        title: { en: "Coordinate", ar: "التنسيق" },
        body: {
          en: "Drawings, disciplines, suppliers and execution requirements, aligned.",
          ar: "تنسيق المخططات والتخصصات والموردين ومتطلبات التنفيذ.",
        },
      },
      {
        title: { en: "Execute", ar: "التنفيذ" },
        body: {
          en: "Works managed and built to the approved drawings and specifications.",
          ar: "إدارة وتنفيذ الأعمال وفق المخططات والمواصفات المعتمدة.",
        },
      },
      {
        title: { en: "Control", ar: "المتابعة" },
        body: {
          en: "Quality and progress tracked; snags and clashes resolved.",
          ar: "متابعة الجودة والتقدم ومعالجة الملاحظات والتعارضات.",
        },
      },
      {
        title: { en: "Deliver", ar: "التسليم" },
        body: {
          en: "Final inspection, snags closed, project handed over.",
          ar: "الفحص النهائي، إغلاق الملاحظات وتسليم المشروع.",
        },
      },
    ],
    statement: [
      { en: "One process.", ar: "منهجية واحدة." },
      { en: "One direction.", ar: "اتجاه واحد." },
      { en: "One accountable team.", ar: "فريق واحد مسؤول." },
    ],
    methodology: {
      kicker: { en: "Engineering-led execution", ar: "تنفيذ بقيادة هندسية" },
      title: {
        en: "Build quality starts *before anyone steps on site.*",
        ar: "جودة التنفيذ *تبدأ قبل دخول الموقع.*",
      },
      body: {
        en: [
          "Our method treats each project as one connected system, from understanding the design and its requirements through to handover, rather than handling each stage or discipline on its own.",
          "Before work starts, we review the drawings and details and coordinate architectural, structural and MEP works, defining requirements, materials and the sequence of works to keep clashes and changes on site to a minimum.",
          "On site, the work is followed and checked against the approved drawings and specifications, with constant coordination between teams and suppliers, and snags and challenges dealt with as they come up.",
          "The goal isn't just to finish the works, but to build them right from the start, keeping to the design, the quality and the agreed budget as closely as possible.",
        ].join("\n\n"),
        ar: [
          "تعتمد منهجيتنا على التعامل مع المشروع كمنظومة مترابطة، تبدأ بفهم التصميم ومتطلباته وتنتهي بالتسليم، بدل التعامل مع كل مرحلة أو تخصص بصورة منفصلة.",
          "قبل بدء التنفيذ، نراجع المخططات والتفاصيل وننسق بين الأعمال المعمارية والإنشائية والكهروميكانيكية، مع تحديد المتطلبات والمواد وتسلسل الأعمال بما يساعد على تقليل التعارضات والتعديلات أثناء التنفيذ.",
          "وخلال العمل في الموقع، تتم متابعة التنفيذ ومقارنته بالمخططات والمواصفات المعتمدة، مع التنسيق المستمر بين فرق العمل والموردين ومعالجة الملاحظات والتحديات التي تظهر أثناء التنفيذ.",
          "الهدف ليس فقط إنهاء الأعمال، وإنما تنفيذها بالطريقة الصحيحة من البداية، مع المحافظة على التصميم والجودة والميزانية المتفق عليها قدر الإمكان.",
        ].join("\n\n"),
      },
      image: img("site/methodology.jpg"),
    },
    execution: {
      kicker: { en: "Execution management", ar: "إدارة التنفيذ" },
      title: {
        en: "Specialised teams, *managed under one direction.*",
        ar: "فرق متخصصة *تحت إدارة واحدة.*",
      },
      body: {
        en: [
          "Every project's needs differ with its scope and nature, so execution teams, contractors and specialist suppliers are managed to the requirements of each stage, under one unified engineering supervision.",
          "This lets us choose the right team and specialism for each piece of work, while keeping one clear point of coordination that ties everyone to the drawings, the programme and the project's requirements.",
          "Execution management covers the sequence of works, coordination between disciplines, checking the site is ready for the next stage, following up suppliers and contractors, and resolving the clashes and snags that could hold the project up.",
          "So the teams don't work as separate parties, but as one execution system heading for one result.",
        ].join("\n\n"),
        ar: [
          "تختلف احتياجات كل مشروع باختلاف نطاقه وطبيعته، لذلك تتم إدارة فرق التنفيذ والمقاولين والموردين المتخصصين وفق متطلبات كل مرحلة، تحت إشراف وإدارة هندسية موحدة.",
          "يتيح هذا النموذج اختيار الفريق والتخصص المناسب لكل عمل، مع الحفاظ على نقطة تنسيق واضحة تربط جميع الأطراف بالمخططات والبرنامج ومتطلبات المشروع.",
          "تشمل إدارة التنفيذ متابعة تسلسل الأعمال، التنسيق بين التخصصات، مراجعة جاهزية الموقع للمراحل التالية، متابعة الموردين والمقاولين، ومعالجة التعارضات والملاحظات التي قد تؤثر على سير المشروع.",
          "وبذلك لا تعمل الفرق كجهات منفصلة، بل كجزء من منظومة تنفيذ واحدة تتجه نحو نتيجة واحدة.",
        ].join("\n\n"),
      },
      image: img("site/execution.jpg"),
    },
    quality: {
      kicker: { en: "Quality", ar: "الجودة" },
      title: {
        en: "Quality is built, *not inspected at the end.*",
        ar: "الجودة تُبنى خلال المشروع، *ولا تُفحص فقط عند نهايته.*",
      },
      body: {
        en: [
          "For us, quality control isn't a last step before handover. It's a continuous process that starts before the work itself is built.",
          "Materials, specifications and details are reviewed before execution, then the works are followed on site through each stage to make sure they match the approved drawings and specifications, with snags documented and followed up before moving on to the next stage.",
          "We also focus on coordination between disciplines, because many quality problems on site don't come from the work itself, but from clashes between architectural, structural, electrical and mechanical works.",
          "We treat quality as the result of a chain of right decisions and constant follow-up, not a final inspection expected at the end of the project.",
        ].join("\n\n"),
        ar: [
          "بالنسبة لنا، مراقبة الجودة ليست خطوة أخيرة تسبق التسليم، بل عملية مستمرة تبدأ قبل تنفيذ العمل نفسه.",
          "تتم مراجعة المواد والمواصفات والتفاصيل قبل التنفيذ، ثم متابعة الأعمال ميدانيًا خلال مراحلها المختلفة للتأكد من توافقها مع المخططات والمواصفات المعتمدة، مع توثيق الملاحظات ومتابعة معالجتها قبل الانتقال إلى المراحل اللاحقة.",
          "كما نركز على التنسيق بين التخصصات، لأن كثيرًا من مشكلات الجودة في الموقع لا تنتج عن العمل نفسه، وإنما عن التعارض بين الأعمال المعمارية والإنشائية والكهربائية والميكانيكية.",
          "نتعامل مع الجودة باعتبارها نتيجة لسلسلة من القرارات الصحيحة والمتابعة المستمرة، وليست مجرد فحص نهائي متوقع في نهاية المشروع.",
        ].join("\n\n"),
      },
      points: [
        { en: "Materials and specifications tracked", ar: "متابعة المواد والمواصفات" },
        { en: "Works reviewed before execution", ar: "مراجعة الأعمال قبل التنفيذ" },
        { en: "Staged inspection of works", ar: "الفحص المرحلي للأعمال" },
        { en: "Coordination between disciplines", ar: "التنسيق بين التخصصات" },
        { en: "Review before handover", ar: "مراجعة الأعمال قبل التسليم" },
        { en: "Snags documented and closed", ar: "توثيق الملاحظات ومعالجتها" },
      ],
      image: img("site/quality.jpg"),
    },
    teamIntro: {
      title: { en: "Behind every idea, *a team that makes the difference.*", ar: "خلف كل فكرة، *فريق يصنع الفرق.*" },
      body: {
        en: "Our leadership blends architectural craft with an entrepreneurial mindset, turning bold ideas into a clear direction. Behind it stands a team known for disciplined coordination and effective site management, from stakeholders and supervision to a smooth build and final handover. Together, we don't only design spaces. We deliver them, with quality and precision at every step.",
        ar: "خلف كل مشروع في المعماري للبناء يقف فريق يجمع بين الخبرة والرؤية والدقة. تمتزج قيادتنا بين الإتقان المعماري والروح الريادية، لتحويل الأفكار الجريئة إلى توجه استراتيجي واضح. ويسند هذه الرؤية فريق يتميز بالتنسيق المنضبط والإدارة الميدانية الفعّالة، بدءًا من التواصل مع أصحاب المصلحة والإشراف على الموقع، وصولًا إلى التنفيذ السلس والتسليم النهائي. معًا، نحن لا نكتفي بتصميم المساحات، بل نحققها بجودة ودقة في كل خطوة.",
      },
    },
  },
  projects,
  team: [
    {
      id: "t-rana",
      name: { en: "Rana Aref", ar: "رنا عارف" },
      role: { en: "Co-founder & CEO", ar: "الشريك المؤسس والرئيس التنفيذي" },
      bio: {
        en: "Rana is an architectural engineer with a Master's in Entrepreneurship and experience across design, site supervision and project execution. As CEO, she leads the company's direction, blending architectural expertise with an entrepreneurial mindset. Her focus on design quality and effective coordination ensures every project delivers on its vision.",
        ar: "رنا مهندسة معمارية حاصلة على ماجستير في ريادة الأعمال، بخبرة في التصميم والإشراف على المواقع وتنفيذ المشاريع. بصفتها الرئيس التنفيذي، تقود توجه الشركة وتجمع بين الخبرة المعمارية والفكر الريادي، ويضمن تركيزها على جودة التصميم والتنسيق الفعّال أن يحقق كل مشروع رؤيته.",
      },
      photo: img("site/team-rana.jpg"),
      order: 1,
    },
    {
      id: "t-asalah",
      name: { en: "Asalah Ashgar", ar: "أصالة أشقر" },
      role: { en: "Co-founder & COO", ar: "الشريك المؤسس ومدير العمليات" },
      bio: {
        en: "Architect and project management professional with strong experience in project coordination, client relations, site supervision and business development. With a background in architecture and a Master's degree in Entrepreneurship, she bridges the technical and business sides of every project she leads, guiding each project's journey from planning and coordination through to execution and delivery.",
        ar: "معمارية ومتخصصة في إدارة المشاريع، بخبرة واسعة في تنسيق المشاريع وعلاقات العملاء والإشراف على المواقع وتطوير الأعمال. بخلفيتها المعمارية وشهادة الماجستير في ريادة الأعمال، تربط بين الجانبين الفني والتجاري في كل مشروع تقوده، وترافق رحلته من التخطيط والتنسيق حتى التنفيذ والتسليم.",
      },
      photo: img("site/team-asalah.jpg"),
      order: 2,
    },
    {
      id: "t-ali",
      name: { en: "Ali Alattar", ar: "علي العطار" },
      role: { en: "Managing Director", ar: "المدير العام" },
      bio: {
        en: "Ali is a decor engineer specialising in managing and executing contracting and fit-out projects, with hands-on experience across all sectors. His expertise spans team leadership, on-site execution supervision, MEP works, quantity surveying and pricing, and coordination between design and execution, delivering high-quality work, meeting timelines and fulfilling client requirements.",
        ar: "مهندس ديكور متخصص في إدارة وتنفيذ مشاريع المقاولات والتشطيبات، بخبرة ميدانية في جميع القطاعات: قيادة الفرق، والإشراف على التنفيذ، والأعمال الكهروميكانيكية، وحصر الكميات والتسعير، والربط بين التصميم والتنفيذ، بما يحقق أعمالًا عالية الجودة تلتزم بالجداول الزمنية وتلبي متطلبات العملاء.",
      },
      photo: img("site/team-ali.jpg"),
      order: 3,
    },
  ],
  settings: {
    companyName: { en: "Archi Builder", ar: "المعماري للبناء" },
    address: {
      en: "JENB8304, 8304 Hussein Ibn Mohsen, 2900 An Naim District, Jeddah 23526",
      ar: "JENB8304، 8304 حسين بن محسن، 2900 حي النعيم، جدة 23526",
    },
    phones: ["0561237800", "0544842842"],
    email: "",
    whatsapp: "966561237800",
    instagram: "",
    linkedin: "",
    mapQuery: "An Naim District, Jeddah 23526",
    coordinates: "21.63°N 39.14°E",
  },
  messages: [],
};
