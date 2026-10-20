import React from 'react';
import { ShieldCheck, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/70 backdrop-blur-md py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-red-600 p-[2px]">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              ระบบสำรวจข้อมูล จปฐ. ประชากร หมู่ที่ 2
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 justify-center md:justify-start">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span>ตำบลกงราป อำเภอป่าบอน จังหวัดพัทลุง</span>
            </div>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-red-950/60 border border-amber-500/30 rounded-2xl px-4 py-2 text-xs">
          <div className="text-slate-400 text-[11px]">พัฒนาและออกแบบระบบโดย:</div>
          <div className="font-extrabold text-amber-300 text-sm">
            นายกิตติศักดิ์ สุขช่วย
          </div>
          <div className="text-slate-300 text-[11px]">
            (ผู้ช่วยฝ่ายปกครองหมู่ที่ 2 ตำบลคลองปราบ) อำเภอบ้านนาสาร จังหวัดสุราษฎร์ธานี
          </div>
        </div>
      </div>
    </footer>
  );
};
