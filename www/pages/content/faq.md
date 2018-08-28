### FAQ
##### What steps do I need to take to start using TaskBot?
**TaskBot** configures itself automatically, this includes:
* Labels
* Colors
* Google Tasks lists

Optional (but recommended) steps the user has to perform manually are:
1. Enabling Multi Inbox
2. Hiding the left sidebar
3. Enabling the keyboard shortcuts
##### How to configure Multi Inbox?
Enable Multi Inbox:
1.  [GMail Settings](https://mail.google.com/mail/u/0/#settings/general)
2.  ["Advanced" Tab](https://mail.google.com/mail/u/0/#settings/labs)
3.  Enable "Multiple Inboxes"
4.  ["Multiple Inboxes" Tab](https://mail.google.com/mail/u/0/#settings/lighttlist)
5.  Set "Below the inbox"

Configure "Current searches" as follows
6. "Pane 0"
	1. Query: `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
	2. Title: `Next`
7.  "Pane 1" 
	8. `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`, title `Actions`
8. "Pane 2" `( label:drafts OR label:!s-pending ) -label:!s-expired`, title `Pending`
9.  "Pane 3" `label:!s-action OR label:!s-next-action OR label:!s-pending OR label:!s-finished OR label:!s-some-day`, title `GTD`
10.  "Pane 4" `label:sent -label:chats`, title `Sent`
##### How to enable the keyboard shortcuts?
While in the [GMail settings](https://mail.google.com/mail/u/0/#settings/general):
1. Tab `General`
2. `Keyboard shortcuts`
![GMail keyboard shortcuts](/static/images/gmail-keyboard.png)
##### Which of the GMail shortcuts are useful for TaskBot?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4Nzg3MTk2MzEsMTE4NTQyMTUwMl19
-->