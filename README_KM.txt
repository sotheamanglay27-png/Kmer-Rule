CAMBODIA ROYALE 3D — Prototype 0.1
=================================

របៀបបើកលេងលើ Android
1. Upload ឯកសារទាំង 4 នេះទៅ GitHub repository របស់អ្នក។
2. នៅ GitHub ចូល Settings → Pages។
3. ក្នុង Build and deployment ជ្រើស Deploy from a branch។
4. ជ្រើស branch main និង folder /(root) រួច Save។
5. រង់ចាំបន្តិច រួចបើកតំណ GitHub Pages របស់ repository។
6. ត្រូវមានអ៊ីនធឺណិត ដើម្បីផ្ទុក Three.js ពី CDN ក្នុង prototype នេះ។

អ្វីដែលមានក្នុង prototype
- បង្កើតគណនី/ចូលគណនីក្នុង browser មួយ (localStorage)
- Server selection screen និង UI កំណត់ចំនួន 500
- Lobby 3D មានប្រាសាទបែបអង្គរ ផ្ទះ ដើមឈើ ទឹក និងសត្វហោះ
- បង្វិលតួអង្គដោយអូស ឬចុច ↶ / ↷
- Start match, ជិះនាគតាម animation និងប៊ូតុងចុះ
- Touch joystick, រត់, វាយប្រហារ, រើសអាវុធ និង inventory អតិបរមា 2

ដែនកំណត់សំខាន់
នេះជាគំរូ client-side សម្រាប់សាកល្បង UI និង gameplay មូលដ្ឋាន មិនមែនហ្គេម online ពិតទេ។
- គណនីមិនមានសុវត្ថិភាព និងមិន sync ទៅឧបករណ៍ផ្សេងទេ។
- ចំនួន 500 ក្នុង server និង 60 ក្នុង match គឺ UI/demo logic; មិនមាន server ពិត។
- អ្នកលេងផ្សេងៗ មិនទាន់ភ្ជាប់តាមបណ្ដាញទេ។
- ក្រាហ្វិកជារូបរាង 3D ដែលបង្កើតដោយ procedural geometry មិនមែន asset 4K ពិត។
- ប្រព័ន្ធ damage តាមក្បាល/ខ្លួន/ជើង, ammo, loot នៅក្នុងផ្ទះ, zone, network anti-cheat និង winner logic ពិត ត្រូវអភិវឌ្ឍបន្ថែម។
- កុំដាក់ពាក្យសម្ងាត់ពិតក្នុង prototype នេះ។

បើចង់បង្កើត online battle royale ពិត ត្រូវការបន្ថែម backend (ឧ. Node.js/WebSocket), database, authoritative game server, matchmaking និង hosting ដែលអាចទ្រទ្រង់អ្នកលេងច្រើន។ ការគាំទ្រ 500 នាក់ក្នុង server និង 60 នាក់ក្នុង match ត្រូវការសាកល្បង load និង server infrastructure ពិត។
