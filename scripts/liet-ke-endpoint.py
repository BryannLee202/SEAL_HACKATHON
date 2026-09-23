#!/usr/bin/env python3
"""Liet ke MOI endpoint REST bang cach doc ma nguon controller.

Sinh tu ma nguon chu khong chep tay: them endpoint moi la no tu co mat
trong danh sach quet, khong phu thuoc ai nho ra.

Xuat moi dong: PHUONG_THUC<TAB>DUONG_DAN<TAB>TEN_CONTROLLER<TAB>QUYEN
QUYEN la chuoi trong @PreAuthorize (muc phuong thuc uu tien hon muc lop),
hoac "-" neu khong co.
"""
import re, sys, glob, os, signal

if hasattr(signal, "SIGPIPE"):
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

GOC = os.path.join(os.path.dirname(__file__), "..",
                   "backend/src/main/java/com/seal/hackathon/controller")

def quyen_trong(khoi):
    m = re.search(r'@PreAuthorize\("([^"]+)"\)', khoi)
    return m.group(1) if m else None

def doc(f):
    s = open(f, encoding="utf-8").read()
    ten = os.path.basename(f)[:-5]

    # @PreAuthorize dat trung muc lop: nam truoc "public class"
    truoc_lop = s[:s.index("public class")] if "public class" in s else ""
    quyen_lop = quyen_trong(truoc_lop)

    m = re.search(r'@RequestMapping\("([^"]+)"\)', truoc_lop)
    goc = m.group(1).rstrip("/") if m else ""

    dong = s.split("\n")
    ra = []
    for i, ln in enumerate(dong):
        m = re.match(r'\s*@(Get|Post|Put|Delete|Patch)Mapping'
                     r'(?:\(\s*(?:value\s*=\s*)?"([^"]*)")?', ln)
        if not m:
            continue
        pt, duong = m.group(1).upper(), m.group(2) or ""

        # Gom ca khoi annotation quanh dong mapping cho den chu ky phuong thuc.
        j = i - 1
        khoi = []
        while j >= 0 and (dong[j].strip().startswith("@")
                          or dong[j].strip().startswith("*")
                          or dong[j].strip().startswith("/*")
                          or not dong[j].strip()):
            khoi.append(dong[j]); j -= 1
        j = i + 1
        while j < len(dong) and "public " not in dong[j]:
            khoi.append(dong[j]); j += 1

        q = quyen_trong("\n".join(khoi)) or quyen_lop or "-"
        day_du = (goc + duong) or duong
        if day_du.startswith("/api"):
            ra.append((pt, day_du, ten, q))
    return ra

def main():
    tat_ca = []
    for f in sorted(glob.glob(os.path.join(GOC, "*.java"))):
        tat_ca.extend(doc(f))
    if not tat_ca:
        print("LOI: khong doc duoc controller nao", file=sys.stderr)
        return 1
    for pt, duong, ten, q in sorted(tat_ca, key=lambda x: (x[1], x[0])):
        print(f"{pt}\t{duong}\t{ten}\t{q}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
