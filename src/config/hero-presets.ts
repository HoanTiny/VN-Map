export type TimeOfDay = "day" | "sunset" | "night";

export interface ImageItem {
  src: string;
  alt: string;
}

export interface BackgroundPreset {
  images: ImageItem[];
  overlay: string; // Custom gradient overlay styling based on background brightness
}

export const REGION_KEYWORDS: Record<string, string[]> = {
  hanoi: ["hanoi", "ha noi"],
  danang: ["da nang", "danang"],
  saigon: ["ho chi minh", "saigon", "hcm"],
  hue: ["hue", "thua thien"],
  hoian: ["hoi an", "hoian", "quang nam"],
  nhatrang: ["nha trang", "khanh hoa"],
  sapa: ["sa pa", "sapa", "lao cai"],
  phuquoc: ["phu quoc", "kien giang"],
  halong: ["ha long", "halong", "quang ninh", "hai phong"],
};

export const PRESETS: Record<string, Record<TimeOfDay, BackgroundPreset>> = {
  default: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Hạ Long nắng trong xanh",
        },
        {
          src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85",
          alt: "Danh thắng Tràng An Ninh Bình hùng vĩ",
        },
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Ruộng bậc thang xanh ngút ngàn Tây Bắc",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=855",
          alt: "Phố cổ Hội An hoàng hôn rực rỡ",
        },
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hoài Hội An buổi chiều tà rực nắng",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Sài Gòn sông đêm lấp lánh chói sáng",
        },
        {
          src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hội An lung linh đèn lồng đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hanoi: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2400&q=85",
          alt: "Hồ Gươm nắng sớm yên bình tháp Rùa",
        },
        {
          src: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hà Nội nhộn nhịp ban ngày",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn Hồ Tây nhuộm đỏ rực rỡ",
        },
        {
          src: "https://images.unsplash.com/photo-1543968996-ee822b8176bc?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Long Biên nhuộm màu nắng chiều tà",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố Tạ Hiện lung linh nhộn nhịp về đêm",
        },
        {
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85",
          alt: "Nhà Thờ Lớn Hà Nội lung linh ánh đèn đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  danang: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Vàng Bà Nà Hills trong nắng mây ngập tràn",
        },
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Bờ biển Đà Nẵng nắng xanh biếc",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn biển Mỹ Khê vàng rực nắng chiều",
        },
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Bán đảo Sơn Trà hoàng hôn bóng chiều",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Rồng phun lửa rực rỡ lấp lánh ban đêm",
        },
      ],
      overlay: "from-black/45 via-black/15 to-transparent",
    },
  },
  saigon: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85",
          alt: "Bưu điện Trung tâm Sài Gòn ngày nắng đẹp",
        },
        {
          src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85",
          alt: "Chung cư Cafe Nguyễn Huệ độc đáo giữa lòng phố",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn buông xuống sông Sài Gòn rực rỡ",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Đêm đô thị Sài Gòn lung linh Landmark 81 sông nước",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hue: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?auto=format&fit=crop&w=2400&q=85",
          alt: "Đại Nội Huế cổ kính trầm mặc ngày nắng",
        },
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hương thuyền rồng êm đềm trôi",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Trường Tiền in bóng sông Hương chiều tà",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2400&q=85",
          alt: "Kinh thành Huế lung linh ánh đèn đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  hoian: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85",
          alt: "Phố cổ Hội An nhà cổ vàng dưới nắng",
        },
        {
          src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85",
          alt: "Chùa Cầu Hội An biểu tượng phố cổ",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2400&q=85",
          alt: "Sông Hoài Hội An hoàng hôn nhuộm vàng",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=2400&q=85",
          alt: "Đèn lồng Hội An lung linh đêm thả hoa đăng",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  nhatrang: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Biển Nha Trang xanh ngọc cát trắng ngày hè",
        },
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Nha Trang nắng vàng thuyền câu",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn biển Nha Trang tím rực rỡ",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?auto=format&fit=crop&w=2400&q=85",
          alt: "Vinpearl Nha Trang lung linh sáng đêm",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  sapa: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2400&q=85",
          alt: "Ruộng bậc thang Sapa xanh ngút ngàn mùa nước đổ",
        },
        {
          src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=2400&q=85",
          alt: "Sapa biển mây trắng bồng bềnh sườn núi",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=85",
          alt: "Đỉnh Fansipan hoàng hôn rực hồng cam",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85",
          alt: "Sapa đêm sương lạnh đèn vàng ấm áp",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  phuquoc: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
          alt: "Bãi Sao Phú Quốc cát trắng nước xanh ngọc",
        },
        {
          src: "https://images.unsplash.com/photo-1559519529-0504685a7327?auto=format&fit=crop&w=2400&q=85",
          alt: "Vùng biển Phú Quốc thiên đường nhiệt đới",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1545231027-63b3f162e0cd?auto=format&fit=crop&w=2400&q=85",
          alt: "Cầu Hôn Phú Quốc hoàng hôn vàng son",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Phú Quốc đêm cảng cá nhộn nhịp ánh đèn",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
  halong: {
    day: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85",
          alt: "Vịnh Hạ Long nắng trong núi đá kì vĩ",
        },
        {
          src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85",
          alt: "Du thuyền Hạ Long lướt giữa hàng nghìn đảo",
        },
      ],
      overlay: "from-black/35 via-black/10 to-transparent",
    },
    sunset: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=2400&q=85",
          alt: "Hoàng hôn Vịnh Hạ Long vàng rực biển ngọc",
        },
      ],
      overlay: "from-black/40 via-black/12 to-transparent",
    },
    night: {
      images: [
        {
          src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2400&q=85",
          alt: "Hạ Long đêm du thuyền và đảo lung linh",
        },
      ],
      overlay: "from-black/50 via-black/15 to-transparent",
    },
  },
};
