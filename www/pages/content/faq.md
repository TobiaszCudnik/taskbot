### FAQ
1. [What steps do I need to take to start using TaskBot?](/faq/#5)
2. [How to configure Multi Inbox?](/faq/#5)
3. [How to enable the keyboard shortcuts?](/faq/#5)
4. [Which of the keyboard shortcuts are useful for TaskBot?](/faq/#5)
5. [How to hide the left GMail sidebar](/faq/#5)
6. [Will TaskBot read my emails?](/faq/#5)

#### What steps do I need to take to start using TaskBot?
**TaskBot** configures itself automatically, this includes:
* Labels
* Colors
* Google Tasks lists

Optional (but recommended) steps the user has to perform manually are:
1. Enabling Multi Inbox
2. Hiding the left sidebar
3. Enabling the keyboard shortcuts

#### How to configure Multi Inbox?
Enable Multi Inbox:
1.  [GMail Settings](https://mail.google.com/mail/u/0/#settings/general)
2.  ["Advanced" Tab](https://mail.google.com/mail/u/0/#settings/labs)
3.  Enable "Multiple Inboxes"
4.  ["Multiple Inboxes" Tab](https://mail.google.com/mail/u/0/#settings/lighttlist)
5.  Set "Below the inbox"

Configure "Current searches" as follows:

* **Next** `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
* **Actions**  `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`
* **Next**  `( label:drafts OR label:!s-pending ) -label:!s-expired`
* **GTD**  `label:!s-action OR label:!s-next-action OR label:!s-pending OR label:!s-finished OR label:!s-some-day`
* **Sent**  `label:sent -label:chats`

After performing all the steps, save the changes.
![GMail keyboard shortcuts](/static/images/gmail-multi-inbox.png)

#### How to enable the keyboard shortcuts?
While in the [GMail settings](https://mail.google.com/mail/u/0/#settings/general):
 - ["General" Tab](https://mail.google.com/mail/u/0/#settings/general)
 - Enable `Keyboard shortcuts`
 - Save Changes
![GMail keyboard shortcuts](/static/images/gmail-keyboard.png)

#### Which of the keyboard shortcuts are useful for TaskBot?

| Function | Shortcut |
|--|--|
| Go to Inbox | `g + i` |
| Compose | `c` |
| Search mail | `/` |
| Open "label as" menu | `l` |
| Back to threadlist | `u` |
| Newer conversation (UP) | `k` |
| Older conversation (DOWN) | `j` |
| Go to Tasks | `g + k` |
| Open conversation | `o` or `Enter` |
| Go to next Inbox section | ` (back-tick) |
| Select all conversations | `* + a` |
| Deselect all conversations | `* + n` |
| Open keyboard shortcut help | `?` 

#### How to hide the left GMail sidebar?
Lorem Ipsum

#### Will TaskBot read my emails?
**TaskBot** will not read the contents of your emails, although it will read the subjects and labels assigned to them. Details about accessed and stored data can be found in our [Privacy Policy](/privacy-policy).
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTEyNTQ2MjIyMiwtNzI3ODY2OTk4LC0xMT
AyMTQ2MzAsMjc5ODk4MDcsMjAyMjU4OTQxMiwxNjE0MjM1NDMw
LDExODU0MjE1MDJdfQ==
-->