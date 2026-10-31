import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin, Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground text-sm mt-16 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <Image
                src="/plmun-logo.png"
                alt="PLMun Official Seal"
                width={36}
                height={36}
                className="object-contain shrink-0"
              />
              <span className="font-bold text-foreground">
                Office of the Registrar
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pamantasan ng Lungsod ng Muntinlupa
              <br />
              University Road, Poblacion, Muntinlupa City, Philippines
            </p>
            <div className="flex items-center space-x-2 text-xs text-primary font-medium pt-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Compliant with RA 10173 (Data Privacy Act)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              University Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Home & Document Catalog
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-primary transition">
                  Request Academic Document
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-primary transition">
                  View Requests & Claiming Slip
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Single Registrar Releasing Window */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Registrar Releasing Window</span>
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Main Service Counter:</strong> Ground Floor, Administration Building.
              </p>
              <p>
                Servicing all approved student credential releases, TOR, Certifications, Diplomas, Good Moral, and CAV.
              </p>
              <p className="text-[11px] text-primary font-medium">
                • 1 Designated Window for all releases.
              </p>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Hotlines & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Registrar Trunkline: (02) 8659-5247</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>registrar@plmun.edu.ph</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Admin Building Room 101</span>
              </li>
            </ul>
            <div className="mt-4 p-2.5 rounded bg-muted/60 border border-border text-[11px] text-muted-foreground">
              Strictly observe your designated appointment slot. No walk-in requests without prior slot reservation.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 Pamantasan ng Lungsod ng Muntinlupa. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by Next.js, Tailwind CSS & shadcn/ui (Grez Theme)</p>
        </div>
      </div>
    </footer>
  );
}
