import Link from "next/link";
import { Github, Instagram, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/categories";

const sections = [
  {
    title: "Khám phá",
    links: [
      { label: "Bản đồ", href: "/explore" },
      { label: "Tìm kiếm", href: "/search" },
      { label: "Vùng miền", href: "/region" },
      { label: "Đóng góp địa điểm", href: "/submit" },
    ],
  },
  {
    title: "Vùng miền",
    links: [
      { label: "Miền Bắc", href: "/region/bac" },
      { label: "Miền Trung", href: "/region/trung" },
      { label: "Miền Nam", href: "/region/nam" },
    ],
  },
  {
    title: "Công ty",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Trợ giúp", href: "/help" },
      { label: "Điều khoản", href: "/terms" },
      { label: "Bảo mật", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 font-display text-h3 text-text">
              <img src="/images/mapVN.png" alt="logo" width={32} height={32} />
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-sm text-body-sm text-text-muted">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://github.com" label="GitHub">
                <Github size={16} />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <Instagram size={16} />
              </SocialLink>
              <SocialLink href="mailto:hello@map-vn.vn" label="Email">
                <Mail size={16} />
              </SocialLink>
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title} className="md:col-span-2">
              <h4 className="text-overline text-text-subtle">{s.title}</h4>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-body-sm text-text-muted hover:text-text"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h4 className="text-overline text-text-subtle">Danh mục</h4>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.key}>
                  <Link
                    href={`/category/${c.key}`}
                    className="text-body-sm text-text-muted hover:text-text"
                  >
                    {c.labelVi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-2 border-t border-border pt-6 text-body-sm text-text-subtle md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Được tạo nên tại Việt Nam.</p>
          <p>v0.1 · beta</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-2 hover:text-text"
    >
      {children}
    </Link>
  );
}
