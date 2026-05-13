Erros presentes ao executar npm run build no client.

src/components/DocumentManager.tsx:2:20 - error TS6133: 'Upload' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                     ~~~~~~

src/components/DocumentManager.tsx:2:36 - error TS6133: 'Download' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                     ~~~~~~~~

src/components/DocumentManager.tsx:2:52 - error TS6133: 'AlertTriangle' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                                     ~~~~~~~~~~~~~

src/components/DocumentManager.tsx:2:67 - error TS6133: 'CheckCircle' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                                                    ~~~~~~~~~~~

src/components/DocumentManager.tsx:2:80 - error TS6133: 'Clock' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                                                                 ~~~~~

src/components/DocumentManager.tsx:2:101 - error TS6133: 'Database' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                                                                                      ~~~~~~~~

src/components/DocumentManager.tsx:2:111 - error TS6133: 'Search' is declared but its value is never read.

2 import { FileText, Upload, Trash2, Download, Edit, AlertTriangle, CheckCircle, Clock, ExternalLink, Database, Search } from 'lucide-react';
                                                                                                                ~~~~~~

src/components/DocumentUploadForm.tsx:2:23 - error TS6133: 'Calendar' is declared but its value is never read.

2 import { X, FileText, Calendar, Upload } from 'lucide-react';
                        ~~~~~~~~

src/components/DocumentUploadForm.tsx:2:33 - error TS6133: 'Upload' is declared but its value is never read.

2 import { X, FileText, Calendar, Upload } from 'lucide-react';
                                  ~~~~~~

src/components/EquipmentCard.tsx:2:17 - error TS6133: 'MapPin' is declared but its value is never read.

2 import { Truck, MapPin, Calendar, Clock, Edit, Settings, Trash2 } from 'lucide-react';
                  ~~~~~~

src/components/EquipmentCard.tsx:2:35 - error TS6133: 'Clock' is declared but its value is never read.

2 import { Truck, MapPin, Calendar, Clock, Edit, Settings, Trash2 } from 'lucide-react';
                                    ~~~~~

src/components/EquipmentCard.tsx:2:42 - error TS6133: 'Edit' is declared but its value is never read.

2 import { Truck, MapPin, Calendar, Clock, Edit, Settings, Trash2 } from 'lucide-react';
                                           ~~~~

src/components/ImageUploader.tsx:2:18 - error TS6133: 'X' is declared but its value is never read.

2 import { Camera, X } from 'lucide-react';
                   ~

src/components/MaintenanceForm.tsx:2:19 - error TS6133: 'Calendar' is declared but its value is never read.

2 import { X, Save, Calendar, Wrench } from 'lucide-react';
                    ~~~~~~~~

src/components/OperatorCard.tsx:2:48 - error TS6133: 'LinkIcon' is declared but its value is never read.

2 import { User, Mail, Shield, Settings, Link as LinkIcon, Trash2 } from 'lucide-react';
                                                 ~~~~~~~~

src/components/Sidebar.tsx:1:1 - error TS6133: 'React' is declared but its value is never read.

1 import React from 'react';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/Sidebar.tsx:2:51 - error TS6133: 'Settings' is declared but its value is never read.

2 import { LayoutDashboard, Truck, Users, FileText, Settings, LogOut, FileBadge } from 'lucide-react';
                                                    ~~~~~~~~

src/pages/Dashboard.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~

src/pages/Dashboard.tsx:2:17 - error TS6133: 'AlertTriangle' is declared but its value is never read.

2 import { Truck, AlertTriangle, FileWarning, CheckSquare, Clock, User, Search, Filter, X } from 'lucide-react';
                  ~~~~~~~~~~~~~

src/pages/Dashboard.tsx:2:79 - error TS6133: 'Filter' is declared but its value is never read.

2 import { Truck, AlertTriangle, FileWarning, CheckSquare, Clock, User, Search, Filter, X } from 'lucide-react';
                                                                                ~~~~~~

src/pages/Dashboard.tsx:5:25 - error TS6133: 'formatDateTime' is declared but its value is never read.

5 import { formatDateUTC, formatDateTime } from '../utils/dateUtils';
                          ~~~~~~~~~~~~~~

src/pages/EquipmentDetail.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState, useRef } from 'react';
         ~~~~~

src/pages/EquipmentDetail.tsx:3:17 - error TS6133: 'Calendar' is declared but its value is never read.

3 import { Truck, Calendar, Settings, AlertTriangle, ClipboardList, CheckCircle, Wrench, Edit, Trash2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
                  ~~~~~~~~

src/pages/EquipmentDetail.tsx:3:27 - error TS6133: 'Settings' is declared but its value is never read.

3 import { Truck, Calendar, Settings, AlertTriangle, ClipboardList, CheckCircle, Wrench, Edit, Trash2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
                            ~~~~~~~~

src/pages/EquipmentDetail.tsx:3:67 - error TS6133: 'CheckCircle' is declared but its value is never read.

3 import { Truck, Calendar, Settings, AlertTriangle, ClipboardList, CheckCircle, Wrench, Edit, Trash2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
                                                                    ~~~~~~~~~~~

src/pages/EquipmentDetail.tsx:155:18 - error TS2322: Type '{ children: Element; size: number; width: string; height: string; viewBox: string; fill: string; stroke: string; strokeWidth: string; strokeLinecap: "round"; strokeLinejoin: "round"; }' is not assignable to type 'SVGProps<SVGSVGElement>'.
  Property 'size' does not exist on type 'SVGProps<SVGSVGElement>'.

155             <svg size={20} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                     ~~~~

src/pages/EquipmentList.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~

src/pages/MyDocuments.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~

src/pages/OperatorDetail.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~

src/pages/OperatorDetail.tsx:3:10 - error TS6133: 'User' is declared but its value is never read.

3 import { User, Shield, AlertTriangle, FileBadge, Calendar } from 'lucide-react';
           ~~~~

src/pages/OperatorDetail.tsx:3:24 - error TS6133: 'AlertTriangle' is declared but its value is never read.

3 import { User, Shield, AlertTriangle, FileBadge, Calendar } from 'lucide-react';
                         ~~~~~~~~~~~~~

src/pages/OperatorDetail.tsx:3:39 - error TS6133: 'FileBadge' is declared but its value is never read.

3 import { User, Shield, AlertTriangle, FileBadge, Calendar } from 'lucide-react';
                                        ~~~~~~~~~

src/pages/OperatorDetail.tsx:3:50 - error TS6133: 'Calendar' is declared but its value is never read.

3 import { User, Shield, AlertTriangle, FileBadge, Calendar } from 'lucide-react';
                                                   ~~~~~~~~

src/pages/OperatorList.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~

src/pages/ServicesList.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useEffect, useState } from 'react';
         ~~~~~


Found 35 errors.