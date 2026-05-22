-- ============================================================================
-- Map-VN — Sáp nhập đơn vị hành chính 01/07/2025
-- ============================================================================
-- Cập nhật province / province_slug cho bảng places & place_submissions theo
-- Nghị quyết 60-NQ/TW và các Nghị quyết của Quốc hội về việc sắp xếp đơn vị
-- hành chính cấp tỉnh. 63 tỉnh/TP cũ → 34 đơn vị mới (6 TP TW + 28 tỉnh).
--
-- Idempotent — safe to re-run. Map cả các tên cũ (Bắc Kạn, Hòa Bình, …) và
-- normalize spelling (Khánh Hoà → Khánh Hòa).
--
-- Paste vào Supabase SQL Editor và Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Bảng tra cứu old → new (in-memory, không tạo bảng thật)
-- ----------------------------------------------------------------------------

do $$
declare
  r record;
  affected int;
begin
  for r in
    select * from (values
      -- ── Giữ nguyên hoặc chuẩn hoá ──
      ('Hà Nội',         'Hà Nội',      'ha-noi'),
      ('Hải Phòng',      'Hải Phòng',   'hai-phong'),
      ('Đà Nẵng',        'Đà Nẵng',     'da-nang'),
      ('TP. HCM',        'TP. HCM',     'tp-hcm'),
      ('TP.HCM',         'TP. HCM',     'tp-hcm'),
      ('Hồ Chí Minh',    'TP. HCM',     'tp-hcm'),
      ('Cần Thơ',        'Cần Thơ',     'can-tho'),
      ('Lai Châu',       'Lai Châu',    'lai-chau'),
      ('Điện Biên',      'Điện Biên',   'dien-bien'),
      ('Sơn La',         'Sơn La',      'son-la'),
      ('Lào Cai',        'Lào Cai',     'lao-cai'),
      ('Tuyên Quang',    'Tuyên Quang', 'tuyen-quang'),
      ('Cao Bằng',       'Cao Bằng',    'cao-bang'),
      ('Lạng Sơn',       'Lạng Sơn',    'lang-son'),
      ('Thái Nguyên',    'Thái Nguyên', 'thai-nguyen'),
      ('Phú Thọ',        'Phú Thọ',     'phu-tho'),
      ('Bắc Ninh',       'Bắc Ninh',    'bac-ninh'),
      ('Hưng Yên',       'Hưng Yên',    'hung-yen'),
      ('Quảng Ninh',     'Quảng Ninh',  'quang-ninh'),
      ('Ninh Bình',      'Ninh Bình',   'ninh-binh'),
      ('Thanh Hóa',      'Thanh Hóa',   'thanh-hoa'),
      ('Nghệ An',        'Nghệ An',     'nghe-an'),
      ('Hà Tĩnh',        'Hà Tĩnh',     'ha-tinh'),
      ('Quảng Trị',      'Quảng Trị',   'quang-tri'),
      ('Quảng Ngãi',     'Quảng Ngãi',  'quang-ngai'),
      ('Gia Lai',        'Gia Lai',     'gia-lai'),
      ('Đắk Lắk',        'Đắk Lắk',     'dak-lak'),
      ('Khánh Hòa',      'Khánh Hòa',   'khanh-hoa'),
      ('Khánh Hoà',      'Khánh Hòa',   'khanh-hoa'),
      ('Lâm Đồng',       'Lâm Đồng',    'lam-dong'),
      ('Tây Ninh',       'Tây Ninh',    'tay-ninh'),
      ('Đồng Nai',       'Đồng Nai',    'dong-nai'),
      ('Vĩnh Long',      'Vĩnh Long',   'vinh-long'),
      ('Đồng Tháp',      'Đồng Tháp',   'dong-thap'),
      ('An Giang',       'An Giang',    'an-giang'),
      ('Cà Mau',         'Cà Mau',      'ca-mau'),
      ('Huế',            'Huế',         'hue'),
      -- ── Đã sáp nhập — map đến đơn vị mới ──
      ('Hải Dương',      'Hải Phòng',   'hai-phong'),
      ('Yên Bái',        'Lào Cai',     'lao-cai'),
      ('Hà Giang',       'Tuyên Quang', 'tuyen-quang'),
      ('Bắc Kạn',        'Thái Nguyên', 'thai-nguyen'),
      ('Vĩnh Phúc',      'Phú Thọ',     'phu-tho'),
      ('Hòa Bình',       'Phú Thọ',     'phu-tho'),
      ('Hoà Bình',       'Phú Thọ',     'phu-tho'),
      ('Bắc Giang',      'Bắc Ninh',    'bac-ninh'),
      ('Thái Bình',      'Hưng Yên',    'hung-yen'),
      ('Hà Nam',         'Ninh Bình',   'ninh-binh'),
      ('Nam Định',       'Ninh Bình',   'ninh-binh'),
      ('Thừa Thiên Huế', 'Huế',         'hue'),
      ('Quảng Nam',      'Đà Nẵng',     'da-nang'),
      ('Quảng Bình',     'Quảng Trị',   'quang-tri'),
      ('Kon Tum',        'Quảng Ngãi',  'quang-ngai'),
      ('Bình Định',      'Gia Lai',     'gia-lai'),
      ('Phú Yên',        'Đắk Lắk',     'dak-lak'),
      ('Ninh Thuận',     'Khánh Hòa',   'khanh-hoa'),
      ('Đắk Nông',       'Lâm Đồng',    'lam-dong'),
      ('Bình Thuận',     'Lâm Đồng',    'lam-dong'),
      ('Bình Dương',     'TP. HCM',     'tp-hcm'),
      ('Bà Rịa - Vũng Tàu', 'TP. HCM',  'tp-hcm'),
      ('Bà Rịa — VT',    'TP. HCM',     'tp-hcm'),
      ('Bà Rịa-VT',      'TP. HCM',     'tp-hcm'),
      ('Vũng Tàu',       'TP. HCM',     'tp-hcm'),
      ('Bình Phước',     'Đồng Nai',    'dong-nai'),
      ('Long An',        'Tây Ninh',    'tay-ninh'),
      ('Bến Tre',        'Vĩnh Long',   'vinh-long'),
      ('Trà Vinh',       'Vĩnh Long',   'vinh-long'),
      ('Tiền Giang',     'Đồng Tháp',   'dong-thap'),
      ('Kiên Giang',     'An Giang',    'an-giang'),
      ('Sóc Trăng',      'Cần Thơ',     'can-tho'),
      ('Hậu Giang',      'Cần Thơ',     'can-tho'),
      ('Bạc Liêu',       'Cà Mau',      'ca-mau')
    ) as t(old_name, new_name, new_slug)
  loop
    update public.places
       set province      = r.new_name,
           province_slug = r.new_slug,
           updated_at    = now()
     where province = r.old_name
       and (province <> r.new_name or province_slug <> r.new_slug);
    get diagnostics affected = row_count;
    if affected > 0 then
      raise notice 'places: % rows  (% → %)', affected, r.old_name, r.new_name;
    end if;

    update public.place_submissions
       set province      = r.new_name,
           province_slug = r.new_slug
     where province = r.old_name
       and (province <> r.new_name or province_slug <> r.new_slug);
    get diagnostics affected = row_count;
    if affected > 0 then
      raise notice 'submissions: % rows  (% → %)', affected, r.old_name, r.new_name;
    end if;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Báo cáo các province chưa map được (debug — nếu list rỗng là OK)
-- ----------------------------------------------------------------------------

do $$
declare
  valid_slugs text[] := array[
    'ha-noi','hai-phong','da-nang','hue','tp-hcm','can-tho',
    'lai-chau','dien-bien','son-la','lao-cai','tuyen-quang','cao-bang','lang-son',
    'thai-nguyen','phu-tho','bac-ninh','hung-yen','quang-ninh','ninh-binh',
    'thanh-hoa','nghe-an','ha-tinh','quang-tri','quang-ngai','gia-lai',
    'dak-lak','khanh-hoa','lam-dong','tay-ninh','dong-nai','vinh-long',
    'dong-thap','an-giang','ca-mau'
  ];
  bad record;
begin
  for bad in
    select distinct province, province_slug, count(*) as n
      from public.places
     where province_slug <> all (valid_slugs)
     group by province, province_slug
  loop
    raise warning 'Unmapped province: % (%) — % rows', bad.province, bad.province_slug, bad.n;
  end loop;
end $$;
