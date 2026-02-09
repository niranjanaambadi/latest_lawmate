// "use client"

// import { useState } from "react"
// import { CaseTable } from "@/components/cases/CaseTable"
// import { CaseFilters } from "@/components/cases/CaseFilters"
// import { CaseGrid } from "@/components/cases/CaseGrid"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { useCases } from "@/lib/hooks/useCases"
// import type { CaseFilters as CaseFiltersType } from "@/types/case"
// import {
//   Plus,
//   Search,
//   LayoutGrid,
//   LayoutList,
//   Download,
//   Filter,
//   SlidersHorizontal,
// } from "lucide-react"
// import Link from "next/link"

// export default function CasesPage() {
//   const [viewMode, setViewMode] = useState<"table" | "grid">("table")
//   const [showFilters, setShowFilters] = useState(true)
//   const [filters, setFilters] = useState<CaseFiltersType>({
//     status: "all",
//     sort: "next_hearing_date",
//     order: "asc",
//     page: 1,
//     per_page: 20,
//   })

//   const { data } = useCases(filters)

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//             Cases
//           </h1>
//           <p className="text-slate-600 mt-1">
//             Manage and track all your cases in one place
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Link href="/cases/new">
//             <Button className="shadow-sm">
//               <Plus className="mr-2 h-4 w-4" />
//               New Case
//             </Button>
//           </Link>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Download className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//               <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//               <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Search and View Controls */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//           <Input
//             placeholder="Search by case number, parties, or keywords..."
//             value={filters.search || ""}
//             onChange={(e) =>
//               setFilters({ ...filters, search: e.target.value, page: 1 })
//             }
//             className="pl-10"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowFilters(!showFilters)}
//             className={showFilters ? "bg-indigo-50 text-indigo-600" : ""}
//           >
//             <SlidersHorizontal className="mr-2 h-4 w-4" />
//             {showFilters ? "Hide" : "Show"} Filters
//           </Button>

//           <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setViewMode("table")}
//               className={
//                 viewMode === "table"
//                   ? "bg-indigo-50 text-indigo-600"
//                   : "text-slate-600"
//               }
//             >
//               <LayoutList className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setViewMode("grid")}
//               className={
//                 viewMode === "grid"
//                   ? "bg-indigo-50 text-indigo-600"
//                   : "text-slate-600"
//               }
//             >
//               <LayoutGrid className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       {showFilters && (
//         <CaseFilters filters={filters} onChange={setFilters} />
//       )}

//       {/* Results Summary */}
//       <div className="flex items-center justify-between text-sm text-slate-600">
//         <div>
//           Showing{" "}
//           <span className="font-medium text-slate-900">
//             {data?.items.length || 0}
//           </span>{" "}
//           of{" "}
//           <span className="font-medium text-slate-900">
//             {data?.total || 0}
//           </span>{" "}
//           cases
//         </div>
//         {filters.search && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setFilters({ ...filters, search: undefined })}
//           >
//             Clear search
//           </Button>
//         )}
//       </div>

//       {/* Cases Display */}
//       {viewMode === "table" ? (
//         <CaseTable filters={filters} onFiltersChange={setFilters} />
//       ) : (
//         <CaseGrid filters={filters} onFiltersChange={setFilters} />
//       )}

//       {/* Pagination */}
//       {data && data.total_pages > 1 && (
//         <div className="flex items-center justify-between border-t border-slate-200 pt-6">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() =>
//               setFilters({ ...filters, page: (filters.page || 1) - 1 })
//             }
//             disabled={(filters.page || 1) <= 1}
//           >
//             Previous
//           </Button>

//           <div className="flex items-center gap-2">
//             {Array.from({ length: Math.min(data.total_pages, 5) }).map(
//               (_, i) => {
//                 const pageNum = i + 1
//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={
//                       pageNum === filters.page ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setFilters({ ...filters, page: pageNum })}
//                   >
//                     {pageNum}
//                   </Button>
//                 )
//               }
//             )}
//           </div>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() =>
//               setFilters({ ...filters, page: (filters.page || 1) + 1 })
//             }
//             disabled={(filters.page || 1) >= data.total_pages}
//           >
//             Next
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }