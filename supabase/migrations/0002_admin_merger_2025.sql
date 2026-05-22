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
  mapping jsonb := jsonb_build_object(
    -- ── Giữ nguyên hoặc chuẩn hoá ──
    'Hà Nội',          jsonb_build_object('name','Hà Nội',      'slug','ha-noi'),
    'Hải Phòng',       jsonb_build_object('name','Hải Phòng',   'slug','hai-phong'),
    'Đà Nẵng',         jsonb_build_object('name','Đà Nẵng',     'slug','da-nang'),
    'TP. HCM',         jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'TP.HCM',          jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Hồ Chí Minh',     jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Cần Thơ',         jsonb_build_object('name','Cần Thơ',     'slug','can-tho'),
    'Lai Châu',        jsonb_build_object('name','Lai Châu',    'slug','lai-chau'),
    'Điện Biên',       jsonb_build_object('name','Điện Biên',   'slug','dien-bien'),
    'Sơn La',          jsonb_build_object('name','Sơn La',      'slug','son-la'),
    'Lào Cai',         jsonb_build_object('name','Lào Cai',     'slug','lao-cai'),
    'Tuyên Quang',     jsonb_build_object('name','Tuyên Quang', 'slug','tuyen-quang'),
    'Cao Bằng',        jsonb_build_object('name','Cao Bằng',    'slug','cao-bang'),
    'Lạng Sơn',        jsonb_build_object('name','Lạng Sơn',    'slug','lang-son'),
    'Thái Nguyên',     jsonb_build_object('name','Thái Nguyên', 'slug','thai-nguyen'),
    'Phú Thọ',         jsonb_build_object('name','Phú Thọ',     'slug','phu-tho'),
    'Bắc Ninh',        jsonb_build_object('name','Bắc Ninh',    'slug','bac-ninh'),
    'Hưng Yên',        jsonb_build_object('name','Hưng Yên',    'slug','hung-yen'),
    'Quảng Ninh',      jsonb_build_object('name','Quảng Ninh',  'slug','quang-ninh'),
    'Ninh Bình',       jsonb_build_object('name','Ninh Bình',   'slug','ninh-binh'),
    'Thanh Hóa',       jsonb_build_object('name','Thanh Hóa',   'slug','thanh-hoa'),
    'Nghệ An',         jsonb_build_object('name','Nghệ An',     'slug','nghe-an'),
    'Hà Tĩnh',         jsonb_build_object('name','Hà Tĩnh',     'slug','ha-tinh'),
    'Quảng Trị',       jsonb_build_object('name','Quảng Trị',   'slug','quang-tri'),
    'Quảng Ngãi',      jsonb_build_object('name','Quảng Ngãi',  'slug','quang-ngai'),
    'Gia Lai',         jsonb_build_object('name','Gia Lai',     'slug','gia-lai'),
    'Đắk Lắk',         jsonb_build_object('name','Đắk Lắk',     'slug','dak-lak'),
    'Khánh Hòa',       jsonb_build_object('name','Khánh Hòa',   'slug','khanh-hoa'),
    'Khánh Hoà',       jsonb_build_object('name','Khánh Hòa',   'slug','khanh-hoa'),
    'Lâm Đồng',        jsonb_build_object('name','Lâm Đồng',    'slug','lam-dong'),
    'Tây Ninh',        jsonb_build_object('name','Tây Ninh',    'slug','tay-ninh'),
    'Đồng Nai',        jsonb_build_object('name','Đồng Nai',    'slug','dong-nai'),
    'Vĩnh Long',       jsonb_build_object('name','Vĩnh Long',   'slug','vinh-long'),
    'Đồng Tháp',       jsonb_build_object('name','Đồng Tháp',   'slug','dong-thap'),
    'An Giang',        jsonb_build_object('name','An Giang',    'slug','an-giang'),
    'Cà Mau',          jsonb_build_object('name','Cà Mau',      'slug','ca-mau'),
    'Huế',             jsonb_build_object('name','Huế',         'slug','hue'),

    -- ── Đã sáp nhập — map đến đơn vị mới ──
    'Hải Dương',       jsonb_build_object('name','Hải Phòng',   'slug','hai-phong'),
    'Yên Bái',         jsonb_build_object('name','Lào Cai',     'slug','lao-cai'),
    'Hà Giang',        jsonb_build_object('name','Tuyên Quang', 'slug','tuyen-quang'),
    'Bắc Kạn',         jsonb_build_object('name','Thái Nguyên', 'slug','thai-nguyen'),
    'Vĩnh Phúc',       jsonb_build_object('name','Phú Thọ',     'slug','phu-tho'),
    'Hòa Bình',        jsonb_build_object('name','Phú Thọ',     'slug','phu-tho'),
    'Hoà Bình',        jsonb_build_object('name','Phú Thọ',     'slug','phu-tho'),
    'Bắc Giang',       jsonb_build_object('name','Bắc Ninh',    'slug','bac-ninh'),
    'Thái Bình',       jsonb_build_object('name','Hưng Yên',    'slug','hung-yen'),
    'Hà Nam',          jsonb_build_object('name','Ninh Bình',   'slug','ninh-binh'),
    'Nam Định',        jsonb_build_object('name','Ninh Bình',   'slug','ninh-binh'),
    'Thừa Thiên Huế',  jsonb_build_object('name','Huế',         'slug','hue'),
    'Quảng Nam',       jsonb_build_object('name','Đà Nẵng',     'slug','da-nang'),
    'Quảng Bình',      jsonb_build_object('name','Quảng Trị',   'slug','quang-tri'),
    'Kon Tum',         jsonb_build_object('name','Quảng Ngãi',  'slug','quang-ngai'),
    'Bình Định',       jsonb_build_object('name','Gia Lai',     'slug','gia-lai'),
    'Phú Yên',         jsonb_build_object('name','Đắk Lắk',     'slug','dak-lak'),
    'Ninh Thuận',      jsonb_build_object('name','Khánh Hòa',   'slug','khanh-hoa'),
    'Đắk Nông',        jsonb_build_object('name','Lâm Đồng',    'slug','lam-dong'),
    'Bình Thuận',      jsonb_build_object('name','Lâm Đồng',    'slug','lam-dong'),
    'Bình Dương',      jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Bà Rịa - Vũng Tàu', jsonb_build_object('name','TP. HCM',   'slug','tp-hcm'),
    'Bà Rịa — VT',     jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Bà Rịa-VT',       jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Vũng Tàu',        jsonb_build_object('name','TP. HCM',     'slug','tp-hcm'),
    'Bình Phước',      jsonb_build_object('name','Đồng Nai',    'slug','dong-nai'),
    'Long An',         jsonb_build_object('name','Tây Ninh',    'slug','tay-ninh'),
    'Bến Tre',         jsonb_build_object('name','Vĩnh Long',   'slug','vinh-long'),
    'Trà Vinh',        jsonb_build_object('name','Vĩnh Long',   'slug','vinh-long'),
    'Tiền Giang',      jsonb_build_object('name','Đồng Tháp',   'slug','dong-thap'),
    'Kiên Giang',      jsonb_build_object('name','An Giang',    'slug','an-giang'),
    'Sóc Trăng',       jsonb_build_object('name','Cần Thơ',     'slug','can-tho'),
    'Hậu Giang',       jsonb_build_object('name','Cần Thơ',     'slug','can-tho'),
    'Bạc Liêu',        jsonb_build_object('name','Cà Mau',      'slug','ca-mau')
  );
  k text;
  v jsonb;
  affected int;
begin
  for k, v in select * from jsonb_each(mapping) loop
    update public.places
       set province      = v->>'name',
           province_slug = v->>'slug',
           updated_at    = now()
     where province = k
       and (province <> v->>'name' or province_slug <> v->>'slug');
    get diagnostics affected = row_count;
    if affected > 0 then
      raise notice 'places: % rows  (% → %)', affected, k, v->>'name';
    end if;

    update public.place_submissions
       set province      = v->>'name',
           province_slug = v->>'slug'
     where province = k
       and (province <> v->>'name' or province_slug <> v->>'slug');
    get diagnostics affected = row_count;
    if affected > 0 then
      raise notice 'submissions: % rows  (% → %)', affected, k, v->>'name';
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
