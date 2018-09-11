${toc}

#### What steps do I need to take to start using TaskBot?

**TaskBot** configures itself automatically, this includes:

* Labels
* Colors
* **Google Tasks** lists

Optional (but recommended) steps the user has to perform manually are:

1.  [Enabling Multi Inbox](/faq#5)
2.  [Hiding the left sidebar](/faq#5)
3.  [Enabling the keyboard shortcuts](/faq#5)

#### How to configure Multi Inbox?

Enable Multi Inbox:

1.  [**GMail** Settings](https://mail.google.com/mail/u/0/#settings/general)
2.  [_"Advanced"_ Tab](https://mail.google.com/mail/u/0/#settings/labs)
3.  Enable "Multiple Inboxes"
4.  [_"Multiple Inboxes"_ Tab](https://mail.google.com/mail/u/0/#settings/lighttlist)
5.  Set _"Below the inbox"_

Configure "Current searches" as follows:

* **Next** `(label:!s-next-action -label:s-finished -label:!s-expired -label:!s-pending) OR (label:!s-pending AND label:unread)`
* **Actions** `label:!s-action -label:!s-next-action -label:!s-finished -label:!s-expired`
* **Next** `( label:drafts OR label:!s-pending ) -label:!s-expired`
* **GTD** `label:!s-action OR label:!s-next-action OR label:!s-pending OR label:!s-finished OR label:!s-some-day`
* **Sent** `label:sent -label:chats`

After performing all the steps, save the changes.
![GMail keyboard shortcuts image](https://taskbot.app/static/images/gmail-multi-inbox.png)

#### How to enable the keyboard shortcuts?

While in the [**GMail** settings](https://mail.google.com/mail/u/0/#settings/general):

* [_"General"_ Tab](https://mail.google.com/mail/u/0/#settings/general)
* Enable _"Keyboard shortcuts"_
* Save Changes
  ![GMail keyboard shortcuts image](https://taskbot.app/static/images/gmail-keyboard.png)

#### Which of the keyboard shortcuts are useful for TaskBot?

| Function                    | Shortcut       |
| --------------------------- | -------------- |
| Go to Inbox                 | `g + i`        |
| Compose                     | `c`            |
| Search mail                 | `/`            |
| Open "label as" menu        | `l`            |
| Back to threadlist          | `u`            |
| Newer conversation (UP)     | `k`            |
| Older conversation (DOWN)   | `j`            |
| Go to Tasks                 | `g + k`        |
| Open conversation           | `o` or `Enter` |
| Go to next Inbox section    | ` (back-tick)  |
| Select all conversations    | `* + a`        |
| Deselect all conversations  | `* + n`        |
| Open keyboard shortcut help | `?`            |

#### How to hide the left GMail sidebar?

Save some space by hiding the left sidebar in **GMail**. You can always access it by hovering with the cursor or you can jump to labels by using [keyboard shortcuts](/faq/#5).

To hide the the left sidebar, click the top-right hamburger icon ☰.
![GMail left sidebar image](/static/images/gmail-left-sidebar.png)

#### Will TaskBot read my emails?

**TaskBot** will not read the contents of your emails, although it will read the subjects and labels assigned to them. Details about accessed and stored data can be found in our [Privacy Policy](/privacy-policy).

#### Can I share a Google Tasks list with someone?

Not at the moment, but we're working on it! Soon you'll be able to share a custom list in **Google Tasks** with another **TaskBot** user, without using any dedicated UI. Tasks from that list will still be able to have a status assigned to them, which will make them show up in one of the status lists. That way you can organize your **GTD** independently of the shared list.

#### How to manually trigger a Google Tasks sync?

Although changes from **GMail** are propagated to **Google Tasks** in real time, the other way around happens only once per 10 minutes (it's an API limitation).

To trigger a sync from **Google Tasks** to **GMail** any time you need it, add a <span class='label command'>!T/Sync GTasks</span> to **any email** (doesn't have to have any `!S/` label or any label for that matter). **TaskBot** will pick it up immediately, trigger the sync and remove the label. That's it.

#### Does TaskBot need my password?

No. You don't have to give **TaskBot** your password, simply because we're using **Google Cloud API**s, which have token-based authentication. 

#### Other questions?

If you have't found an answer to your question here, you can always ask it on the [Google Group](https://groups.google.com/forum/#!forum/taskbotapp).

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU2NDY2MDg5NywxMTI1NDYyMjIyLC03Mj
c4NjY5OTgsLTExMDIxNDYzMCwyNzk4OTgwNywyMDIyNTg5NDEy
LDE2MTQyMzU0MzAsMTE4NTQyMTUwMl19
-->
