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

Configure "Current searches" as follows:

###### "Pane 0"
1. Query: `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
2. Title: `Next`
###### "Pane 1" 
1. Query: `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`
2. Title `Actions`
###### "Pane 2"
1. Query: `( label:drafts OR label:!s-pending ) -label:!s-expired`
2. Title `Pending`
###### "Pane 3"
1. Query: `label:!s-action OR label:!s-next-action OR label:!s-pending OR label:!s-finished OR label:!s-some-day`
2. Title `GTD`
###### "Pane 4"
1. Query: `label:sent -label:chats`
2. Title `Sent`

After performing all the steps, save the changes.
![GMail keyboard shortcuts](/static/images/gmail-multi-inbox.png)

#### How to enable the keyboard shortcuts?
While in the [GMail settings](https://mail.google.com/mail/u/0/#settings/general):
1. Tab `General`
2. Enable `Keyboard shortcuts`
3. Save Changes
![GMail keyboard shortcuts](/static/images/gmail-keyboard.png)
##### Which of the GMail shortcuts are useful for TaskBot?
Go to Inbox `g + i`
Compose `c`
Search mail `/`
Open "label as" menu `l`
Back to threadlist `u`
Newer conversation (UP) `k`
Older conversation (DOWN) `j`
Go to Tasks `g + k`
Open conversation `o or Enter`
Go to next Inbox section `backtick`
Select all conversations `* + a`
Deselect all conversations `* + n`
Select read conversations `* + r`
Select unread conversations `* + u`
Select starred conversations `* + s`
Select unstarred conversations `* + t`
Open keyboard shortcut help `?`
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjEyMDIxNzE4MiwyMDIyNTg5NDEyLDE2MT
QyMzU0MzAsMTE4NTQyMTUwMl19
-->