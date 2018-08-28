### FAQ
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
6. Save CH

Configure "Current searches" as follows:
7. "Pane 0"
	1. Query: `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
	2. Title: `Next`
8.  "Pane 1" 
	1. Query: `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`
	2. Title `Actions`
9. "Pane 2"
	1. Query: `( label:drafts OR label:!s-pending ) -label:!s-expired`
	1. Title `Pending`
10.  "Pane 3"
	1. Query: `label:!s-action OR label:!s-next-action OR label:!s-pending OR label:!s-finished OR label:!s-some-day`
	1. Title `GTD`
11.  "Pane 4"
	1. Query: `label:sent -label:chats`
	1. Title `Sent`
#### How to enable the keyboard shortcuts?
While in the [GMail settings](https://mail.google.com/mail/u/0/#settings/general):
1. Tab `General`
2. `Keyboard shortcuts`
![GMail keyboard shortcuts](/static/images/gmail-keyboard.png)
##### Which of the GMail shortcuts are useful for TaskBot?
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTUxNjY5MDYwNywxMTg1NDIxNTAyXX0=
-->